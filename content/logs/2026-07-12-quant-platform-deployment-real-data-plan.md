---
title: Quant Research Platform：部署与真实数据研究计划
date: 2026-07-12
summary: Research Workbench v1 已完成合并与跨仓库验证，下一阶段将系统部署到 VPS，接入真实 development 数据，并开始受预注册约束的因子与策略研究。
tags: [Quant, Research OS, Deployment, Research]
status: published
---

## 当前里程碑

Quant-Trade Research Integration v1 与 Quant-OS Research Workbench v1 已分别合并到 `main`。

```text
Quant-Trade main
  merge commit: 3b6eb5148ae01346fe50da62aac698f44aade47a

Quant-OS main
  merge commit: b0e7448c768e34f1abd5b7aeb8e0f7403497fc03
```

合并前验证已经覆盖：

- Quant-Trade compileall、Ruff、strict mypy、全量 pytest。
- `integration_contract_v1` 协议测试。
- 100,000 bars 因子性能回归。
- Quant-OS PostgreSQL migration、后端测试和前端 production build。
- 私有仓库之间的真实 Catalog 同步。
- 真实 FactorExperiment、Artifact 导入、DuckDB 查询和 FactorMetrics。
- 真实 V0.3 StrategyExperiment、BacktestRun 导入、MTM、Trades、Fills 和 Diagnostics 查询。

确定性 fixture 验证结果：

```text
FactorRun
  5 行可查询 FactorValues
  10 个 FactorMetrics
  4 个指标可计算

V0.3 BacktestRun
  10 行连续 MTM equity
  31 个回测与诊断指标
```

该 fixture 只证明工程链路完整，不证明策略盈利。样本没有触发交易，所以 Trades、Fills 和逐笔 Diagnostics 是合法空表。

## 下一阶段总目标

下一阶段从“工程闭环”进入“真实 development 数据研究闭环”。

```text
合并后的稳定版本
→ VPS 部署
→ 真实 development 数据注册
→ 真实 FactorExperiment
→ 真实 StrategyExperiment
→ 研究结果审查
→ 候选策略冻结
→ 独立确认性验证
→ Shadow
```

当前仍然不进入 Demo、Live 和 lockbox。

## 阶段 0：主分支稳定化

目标是把当前协议与代码冻结为可复现的研究版本。

工作内容：

- 确认 Quant-Trade 与 Quant-OS `main` 的 CI 全部通过。
- 固定当前 `integration_contract_v1`，后续破坏性修改必须升级协议版本。
- 记录两个仓库之间的兼容 commit。
- 为 `main` 设置 required checks。
- 生成正式 release notes。
- 部署稳定前暂时保留功能分支。

验收：

```text
main CI 通过
协议不再漂移
两个仓库能够互相定位兼容版本
部署版本可以重复安装
```

## 阶段 1：部署到现有 VPS

目标部署结构：

```text
Caddy
  ↓
Quant-OS Frontend
  ↓
Quant-OS FastAPI
  ↓
PostgreSQL + Redis
  ↓
Celery Worker
  ↓
Quant-Trade Trusted Local Runner
```

沿用现有 VPS 的 Docker Compose 与 Caddy 架构，不增加 Kubernetes、Kafka、ClickHouse 或微服务拆分。

VPS 规格为 2 vCPU / 4 GB RAM，因此运行约束为：

```text
Celery concurrency = 1
同一时间只运行一个大型研究任务
避免同时进行前端 build 和长回测
Parquet 查询按列、分页和时间范围执行
```

部署组件：

- Quant-OS frontend。
- Quant-OS FastAPI backend。
- PostgreSQL。
- Redis。
- Celery worker。
- Quant-Trade research environment。
- PyArrow 与 DuckDB。
- 独立 artifact、dataset、database backup 和 log 目录。

安全要求：

- PostgreSQL 与 Redis 不暴露公网。
- Quant-OS API 不直接裸露，统一经过 Caddy。
- 管理入口增加访问认证。
- Quant-Trade 只开放 allowlist Research CLI。
- VPS 不保存 Binance 私有 API 凭证。
- 不提供 OMS、Demo、Live 或手动下单入口。
- 限制任务超时、CPU、内存和磁盘使用。

部署验收：

```text
/health 通过
/readiness 通过
Catalog 同步成功
22 个 Factor 可见
5 个 Strategy configuration 可见
重启后数据库和 artifact 不丢失
PostgreSQL / Redis 无公网端口
```

## 阶段 2：真实 development 数据

真实数据是下一阶段的核心瓶颈。

数据分三级：

### Smoke Dataset

用于部署后的快速验证：

```text
BTCUSDT
ETHUSDT
1m / 5m Kline
Mark Price
Funding
7–14 天
```

### Medium Development Dataset

用于第一轮真实研究：

```text
BTCUSDT
ETHUSDT
1m / 5m Kline
Mark Price
Funding
3–6 个月
```

### Full Development Dataset

用于正式 development 研究：

```text
V0.3
  BTC / ETH

V0.5–V0.9
  BTC / ETH / SOL / BNB / XRP
```

每个 DatasetVersion 必须包含：

- DatasetManifest。
- SHA256。
- Dataset fingerprint。
- 时间范围。
- Instruments 与 intervals。
- Kline gap report。
- Funding 完整性报告。
- Mark Price 完整性报告。
- 数据来源与 source commit。
- `development_only=true`。

数据要求：

- `available_time` 必须晚于 Kline close time。
- Funding 只能在 settlement 可用后进入研究。
- Mark Price 缺失必须显式报告。
- 相同数据生成相同 fingerprint。
- 数据集不得进入 Git 仓库。
- 数据范围不得触及 lockbox。

## 阶段 3：第一轮真实因子研究

第一轮只研究 V0.3 的 `standardized_return.lookback_bars`。

采用单变量、少量 trial：

```text
Baseline
Experiment A：较短窗口
Experiment B：较长窗口
maximum_trials = 3
```

主要指标：

- Coverage。
- Time-Series IC。
- Pooled Panel IC。
- Sign Agreement。
- Forward Return。
- Decay。
- Quantile Return。
- Long-Short Return。
- Symbol stability。
- Regime stability。
- Cost sensitivity。

因子不能只凭 IC 晋级。至少还需要：

```text
Coverage 不明显恶化
不同时间段方向一致
结果不由单个 symbol 驱动
Decay 与目标持仓周期匹配
加入费用后仍有意义
```

所有失败实验保留。

## 阶段 4：第一轮真实策略研究

第一轮策略研究只运行 V0.3。

先建立不可修改 Baseline：

```text
固定 StrategyVersion
固定 DatasetVersion
默认参数
BASELINE execution scenario
2x leverage
固定成本模型
```

随后分别研究：

- `alpha_threshold`。
- `setup_validity_bars`。

每次实验只改变一个参数。

执行压力场景：

- BASELINE。
- COST_2X。
- LATENCY_STRESSED。
- PARTIAL_FILL_STRESSED。
- PROTECTION_DELAY_STRESSED。
- COMBINED_STRESS。

杠杆场景：

```text
2x：主要研究
5x：主要研究
10x：仅压力测试
20x：仅压力测试
```

策略评价：

- Net PnL。
- Total Return。
- MDD。
- ProfitFactor。
- Trade Count。
- Win Rate。
- MAE / MFE。
- Fee、Slippage、Funding。
- Margin utilization。
- Liquidation buffer。
- Symbol、Side、Month、Regime 集中度。

候选不能按最高 PnL 自动选择，必须同时通过成本、延迟、时间分段、交易数量和回撤约束。

## 阶段 5：根据真实使用完善 Quant-OS

只修复真实研究暴露的问题，不继续堆积空页面。

优先项：

- Baseline 与 Experiment 对比。
- Run 详情。
- Factor Decay 与 Quantile Return 图。
- MTM equity 与 Drawdown。
- MAE / MFE 分布。
- Symbol、Side、Month、Regime 分组。
- Stress scenario 对比。
- Artifact lineage 与数据完整性警告。
- unavailable 原因。
- 失败任务重试和取消体验。

每个实验还必须保存：

```text
实验备注
实验结论
接受或拒绝原因
审查人
候选状态
```

## 阶段 6：候选冻结

第一轮研究完成后停止继续试参数。

流程：

1. 导出完整实验清单。
2. 统计总 trial 数。
3. 保留所有失败结果。
4. 最多选择一个候选。
5. 冻结 StrategyVersion、FactorVersion 与参数。
6. 生成 Candidate Manifest。
7. 记录选择理由与已知限制。
8. 不再利用同一 development 数据继续修改候选。

Candidate Manifest 至少包含：

- Strategy commit 与 fingerprint。
- Config fingerprint。
- Factor versions。
- Dataset versions。
- Cost assumptions。
- Execution scenarios。
- Experiment count。
- Selection rationale。
- Known limitations。

## 阶段 7：独立确认性验证

确认性验证前必须预先冻结：

- Primary metric。
- MDD 上限。
- 最低 Trade Count。
- 成本压力要求。
- 明确失败条件。
- 只允许运行一次。
- 分析代码与候选参数。

确认性数据不能用于再次调参。

只有确认性结果满足全部条件，才进入：

```text
Research Candidate
→ Shadow Candidate
```

失败后不能继续使用同一确认数据优化。

## 阶段 8：Shadow

Shadow 属于下一个大版本。

Quant-OS 初期只提供：

- Shadow 启动请求。
- Shadow 状态。
- Signal 与 RiskDecision。
- 模拟 Position。
- 数据延迟。
- Strategy fingerprint。
- Replay / Shadow parity。
- 运行告警。

仍不提供：

- Demo 或 Live 下单。
- 交易凭证管理。
- 手动下单按钮。
- 即时修改杠杆。
- OS 直接生成 RiskAuthorization。

## 当前优先级

```text
P0
  主分支稳定化
  VPS 部署
  Caddy 访问控制
  数据库与 artifact 备份

P1
  真实 development 数据
  真实 FactorExperiment
  真实 V0.3 StrategyExperiment

P2
  结果对比与诊断完善
  候选冻结
  研究治理

P3
  独立确认性验证
  Shadow

暂不进行
  V0.9 调参
  lockbox
  Demo
  Live
  AI 自动研究
```

下一个开发任务正式定义为：

> **Quant Research Platform Deployment & Real Development Data v1**

先完成部署和第一个真实 DatasetVersion，再开始因子与策略研究。