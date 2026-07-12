---
title: Quant Research Workbench v1：跨仓库集成验证完成
date: 2026-07-12
summary: Quant-Trade 与 Quant-OS 已在功能分支上完成协议对齐、真实研究实验链路和参数工作台验证，仍保持 Research-only 与未合并状态。
tags: [Quant, Research OS, Trading]
status: published
---

## 验证结论

Quant-Trade 与 Quant-OS 的 Research Workbench v1 已经在各自功能分支完成工程验证。

当前状态不是实盘系统完成，也不是已经合并到 `main`，而是：

```text
Quant-Trade Research Integration v1
+
Quant-OS Research Workbench v1
+
真实跨仓库 FactorExperiment / StrategyExperiment
=
功能分支验证通过
```

对应版本：

```text
Quant-Trade
branch: feature/research-integration-v1
commit: 30b91df834f3d13e39860255078b0846e7e837d4

Quant-OS
branch: feature/research-workbench-v1
commit: 6cc7db5b95de3112ec3a6760c0bfe331128f5bd4
```

两个 Pull Request 仍然保持 Draft，没有自动合并。

## Quant-Trade 验证结果

Quant-Trade 的 CI 已完整通过：

- Python compileall
- Research Integration 范围 Ruff
- strict mypy
- `integration_contract_v1` 协议测试
- 100,000 bars 因子性能回归
- 全量 pytest
- Catalog export smoke test

Catalog 固定输出：

- 22 个 Factor
- 5 个 Strategy configuration
- 完整 ParameterSchema
- Strategy / Factor fingerprint
- Source commit
- Capability 与执行资格状态

Research CLI 已固定为：

```text
validate_request
export_catalog
run_factor_experiment
run_strategy_experiment
```

跨仓库请求、CLI stdout、ArtifactManifest 与 Parquet schema 已统一为 `integration_contract_v1`。

## Quant-OS 验证结果

Quant-OS 的独立 CI 已完整通过：

- PostgreSQL migration
- Backend compileall
- Backend Ruff
- Backend mypy
- Backend full pytest
- Frontend lint
- Frontend typecheck
- Frontend tests
- Frontend production build

Quant-OS 通过只读 GitHub token 在 CI 中 checkout 私有 Quant-Trade 功能分支。该 token 只用于读取代码，没有被提交到仓库、日志或 `.env`。

## 真实跨仓库链路

CI 实际运行了以下流程，而不是只使用 Mock：

```text
Quant-OS
→ checkout Quant-Trade
→ 调用 export_catalog
→ 同步 22 个 Factor 和 5 个 Strategy configuration
→ 注册 development fixture dataset
→ 创建 Preregistration
→ 创建 FactorExperiment
→ 调用 Quant-Trade Factor Research CLI
→ 校验并导入 ArtifactManifest
→ DuckDB 查询 FactorValues
→ 计算 FactorMetrics
→ 创建 V0.3 StrategyInstance
→ 创建 StrategyExperiment
→ 调用 Quant-Trade Backtest Research CLI
→ 导入 BacktestRun
→ 查询 Trades / Fills / MTM / Diagnostics
```

### FactorExperiment 结果

确定性小型 fixture 产生：

- 5 行可查询 FactorValues
- 10 个 FactorMetrics
- 其中 4 个指标可计算
- 其余指标按照样本条件明确标记为 `unavailable`

系统没有用 `0` 伪装缺失指标。

### V0.3 StrategyExperiment 结果

确定性小型 fixture 产生：

- 10 行连续 MTM equity
- 31 个回测及诊断汇总指标
- Trades、Fills 和 Diagnostics Parquet 被成功生成、导入和查询

该 fixture 样本较小，没有触发真实交易，所以交易、成交与逐笔诊断行数为 0。这不是策略无效证明，也不是盈利证明；它只用于验证协议、任务、Artifact 和查询链路。

此前无交易回放会生成空 MTM。现在 Quant-Trade 会在无交易情况下输出与行情时间轴对应的平坦 MTM equity，避免 OS 将“没有交易”误判为“没有权益数据”。

## 参数调整工作台

Quant-OS 已不再使用写死的输入框。因子研究和策略研究页面会读取 Quant-Trade Catalog 中的真实 ParameterSchema。

页面只为以下权限生成可编辑控件：

- `ADJUSTABLE_RESEARCH`
- `PREREGISTRATION_REQUIRED`

以下参数只读：

- `READ_ONLY`
- `FIXED`
- `RISK_HARD_LIMIT`
- `EXECUTION_LOCKED`

修改参数时，系统会：

```text
读取真实 ParameterSchema
→ 验证类型、范围和枚举
→ 创建 Preregistration
→ 记录 parameters_to_change
→ 记录 allowed_values
→ 创建不可变 Experiment
→ 调用 Quant-Trade Research CLI
```

StrategyInstance 必须绑定 Catalog 中的真实 `parameter_schema_version`。数据库写入路径会拒绝伪造或过期的 Schema version，也会拒绝把 Research Workbench 的实例标记为可执行。

目前开放的最小研究参数仍然是：

```text
V0.3 strategy
  alpha_threshold
  setup_validity_bars

standardized_return factor
  lookback_bars
```

V0.9 策略参数继续全部锁定。

## 安全边界

本轮验证保持以下边界：

- V0.9 继续 `research_only=true`
- V0.9 继续 `execution_eligible=false`
- 没有 Demo 或 Live 下单
- 没有访问 lockbox
- 没有调用 Binance 私有 API
- Quant-OS 不持有交易凭证
- 没有生成可消费的 RiskAuthorization
- 浏览器不能提交任意 Python 或 shell 命令
- Runner 使用固定模块、argv list 与 `shell=False`
- 10x / 20x 仍然只属于压力研究
- 没有自动策略晋级

## 当前可以做什么

在功能分支部署 Quant-OS 并配置 Quant-Trade trusted local runner 后，可以：

- 查看策略与因子目录
- 查看策略使用的因子依赖
- 查看 ParameterSchema 与权限
- 修改白名单研究参数
- 创建 Preregistration
- 发起 FactorExperiment
- 发起 StrategyExperiment
- 导入不可变 FactorRun / BacktestRun
- 查看 FactorValues、FactorMetrics 和 Decay 数据
- 查看 MTM equity、Trades、Fills 和 Diagnostics
- 查看 Development、lockbox 和 execution eligibility 状态

当前仍不能：

- 在浏览器中修改策略 Python 代码
- 从 Quant-OS 发起 Demo 或 Live 下单
- 自动打开 lockbox
- 自动晋级策略
- 将 10x / 20x 压力结果转为交易授权

## 下一步

下一步不应继续添加策略或更多页面。应先进行合并决策和本地部署验收：

```text
1. Review Quant-Trade Draft PR
2. Review Quant-OS Draft PR
3. 决定是否分别合并到 main
4. 在目标主机配置 trusted local runner 路径
5. 导入真实 development dataset
6. 运行一次真实 FactorExperiment
7. 运行一次真实 V0.3 StrategyExperiment
8. 检查资源占用、任务恢复和页面交互
9. 再讨论 Shadow 管理
```

Research Workbench v1 已经证明两个仓库可以通过受控协议协同工作，但策略本身仍未通过确认性验证，lockbox 仍未打开，真实交易阶段仍然冻结。
