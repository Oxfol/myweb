---
title: Quant OS 与 Quant Trade：研究工作台实施计划
date: 2026-07-12
summary: 将独立的策略系统与研究平台通过受控契约连接，先完成因子、策略、回测和实验治理，再讨论 Shadow、Demo 与实盘。
tags: [Quant, Research OS, Trading]
status: published
---

## 当前状态

目前量化项目被拆成两个独立仓库。

**Quant-Trade** 是实际的策略与交易研究系统，已经包含策略、因果回测、风险控制、Shadow、Binance Demo 适配、状态恢复和执行安全边界。当前 Runtime 主要运行 V0.3，最新研究版本已经发展到 V0.9，但 V0.9 仍然属于 `research_only`，没有获得执行资格，也没有打开确认性 lockbox。

**Quant-OS** 目前完成了 SAD v1.0 架构文档，但还没有完整应用代码。它的目标不是替代 Quant-Trade，也不是重新写一套交易机器人，而是成为统一的研究、实验、结果管理与可视化入口。

两个项目继续保持独立：

```text
Quant-Trade
  负责策略、因子计算、因果回测、风险语义和研究执行

Quant-OS
  负责实验配置、任务调度、运行记录、因子评价和可视化
```

## 这一阶段要解决的问题

当前最大的工程问题不是缺少更多指标，而是研究路径与运行路径尚未完全统一。

- Runtime 与最新研究版本使用不同入口。
- 策略内部存在不同版本的 Signal / Intent 表达。
- 因子仍嵌在策略实现中，没有形成独立的 Factor catalog。
- 回测结果缺少统一 BacktestRun、连续 MTM equity 和完整 artifact lineage。
- 参数调整尚未被正式约束，容易在同一 development 数据上反复试错。
- Quant-OS 目前还不能发起 FactorExperiment 或 StrategyExperiment。

因此，接下来的开发顺序是先让 Quant-Trade 成为一个确定性、只读的 Research Runner，再让 Quant-OS 调用它。

## 最终研究闭环

### 因子研究

```text
FactorDefinition
→ FactorVersion
→ FactorExperiment
→ FactorRun
→ FactorValues
→ Forward Return
→ FactorMetrics
→ 绑定 StrategyInstance
```

### 策略研究

```text
StrategyVersion
→ StrategyInstance
→ StrategyExperiment
→ BacktestRun
→ MTM Equity
→ Trades / Fills
→ MAE / MFE
→ 压力场景
→ 结果对比
```

所有实验都必须创建新记录，不能覆盖已有版本。正收益不会自动提高执行资格，失败实验也不能被删除。

## 第一阶段：Quant-Trade Research Integration v1

第一阶段只改造 Quant-Trade，不做策略调优。

### 1. 统一标识与策略契约

建立跨系统稳定模型：

- `InstrumentId`
- `DatasetReference`
- `StrategyReference`
- `StrategyInput`
- `StrategyOutput`
- `Signal`
- `RiskHint`
- `Explanation`
- `StrategyCapabilities`

`InstrumentId` 不再只使用 `BTCUSDT` 这类 symbol，而是明确包含交易所、市场类型和标的，例如：

```text
BINANCE:USDT_PERPETUAL:BTCUSDT
```

V0.3 与 V0.9 都通过 adapter 接入同一个 `StrategyRunner`。Adapter 只能做数据结构转换，不能改变原始信号方向、时间或参数。

### 2. 冻结执行能力边界

V0.9 在本阶段继续保持：

```text
research_only = true
execution_eligible = false
demo_allowed = false
live_allowed = false
```

Research Runner 不导入 authenticated execution adapter，不读取交易凭证，不生成可消费的 RiskAuthorization，也不能访问 lockbox。

### 3. 建立 Factor catalog

现有策略内部变量分为四类：

- **Alpha**：用于预测方向或相对收益。
- **市场状态**：用于识别 Regime、breadth、波动和过滤条件。
- **风险变量**：用于 Stop、仓位、杠杆和清算距离。
- **执行质量**：用于手续费、滑点、延迟和成交质量。

初始注册的因子包括：

```text
V0.3
  session_vwap
  atr_14
  standardized_return
  vwap_deviation
  momentum_setup
  reversal_setup

V0.5–V0.7
  btc_regime
  return_1d / return_7d / return_30d
  realized_volatility_30d
  breadth
  volatility_weight
  quality_weight

V0.8
  btc_beta_60d
  residual_return
  residual_momentum_14d

V0.9
  settled_funding_mean_9
  settled_funding_mean_21
  funding_quality
```

这些因子通过只读 `FactorProvider` 输出，不复制新的计算逻辑，也不改变原公式。

### 4. 参数 Schema 与预注册

每个策略版本和因子版本必须声明参数类型、范围和权限：

- `READ_ONLY`
- `ADJUSTABLE_RESEARCH`
- `FIXED`
- `RISK_HARD_LIMIT`
- `PREREGISTRATION_REQUIRED`
- `EXECUTION_LOCKED`

浏览器或外部系统只能修改白名单中的研究参数。风险硬限制不能被提高，执行锁定参数不能被实验覆盖。

每次实验必须先记录：

- Hypothesis
- Expected mechanism
- Primary metric
- Constraint metrics
- Parameters to change
- Allowed values
- Experiment budget
- Maximum trials
- Development dataset
- `lockbox_access = false`

### 5. 只读 Research CLI

Quant-Trade 对外提供固定命令：

```text
validate_request
run_strategy_experiment
run_factor_experiment
export_catalog
```

调用方只能提交 JSON 规范化请求，不能传入任意 Python module、shell command 或 executable。

### 6. 不可变研究产物

FactorExperiment 输出：

```text
factor_run.json
factor_values.parquet
forward_returns.parquet
factor_quality.parquet
factor_diagnostics.json
artifact_manifest.json
```

StrategyExperiment 输出：

```text
backtest_run.json
metrics.json
trades.parquet
fills.parquet
mtm_equity.parquet
diagnostics.parquet
execution_scenarios.json
artifact_manifest.json
```

每个产物都有 schema version、SHA256、row count、source commit 和 lineage。

### 7. 回测可信度增强

新增连续 mark-to-market equity：

- wallet balance
- equity
- realized / unrealized PnL
- fees
- Funding
- gross / net exposure
- initial / maintenance margin
- liquidation buffer
- drawdown

每笔交易增加：

- MAE
- MFE
- MAE_R
- MFE_R
- holding time
- entry / exit Regime
- leverage
- fee
- slippage
- Funding
- max margin usage
- min liquidation buffer

### 8. 执行压力场景

使用同一份 signal plan 比较：

- `BASELINE`
- `COST_2X`
- `LATENCY_NORMAL`
- `LATENCY_STRESSED`
- `PARTIAL_FILL_STRESSED`
- `VOLATILITY_SLIPPAGE_STRESSED`
- `PROTECTION_DELAY_STRESSED`
- `COMBINED_STRESS`

杠杆统一展示 2x、5x、10x、20x。2x 和 5x 是优先研究区间，10x 和 20x 只作为压力测试，不能自动进入 Demo 或 Live。

### 第一阶段验收标准

- V0.3 与 V0.9 都能通过同一 StrategyRunner 执行。
- 新旧路径 parity test 通过。
- 因子按类别正确注册。
- FactorRun 与 BacktestRun 不可覆盖。
- 研究请求不能访问 lockbox。
- Research Runner 不加载交易凭证或 execution adapter。
- V0.9 仍然没有执行资格。
- 所有 artifact 可以被外部系统校验和导入。

## 第二阶段：Quant-OS Research Workbench v1

Quant-Trade 的 Research Integration 通过人工检查后，再实现 Quant-OS。

### MVP 技术栈

```text
Frontend
  Next.js
  TypeScript
  TailwindCSS
  shadcn/ui
  TanStack Query
  ECharts

Backend
  FastAPI
  PostgreSQL
  Redis
  Celery
  DuckDB
  Parquet
```

系统仍然面向 2 vCPU / 4 GB RAM 的单机环境。MVP 不引入 ClickHouse、Kafka、Kubernetes，也不拆分微服务。Celery 并发默认保持为 1。

### 初始页面

第一版启用：

- 总览
- 数据中心
- 因子研究
- 策略研究
- 回测中心
- 任务中心
- Research Runner 设置

模拟交易、实盘交易、组合管理、完整风控中心、插件中心、模型中心和 AI研究员先隐藏，不创建无数据的空壳页面。

### Trusted Local Runner

Quant-OS 通过受控 subprocess 调用 Quant-Trade Research CLI：

```text
Quant-OS Celery Worker
→ 校验 ExperimentSpec
→ 调用固定 Research CLI
→ 校验 ArtifactManifest
→ 校验 SHA256
→ 导入 Run metadata
→ DuckDB 查询 Parquet
→ 前端展示
```

调用过程禁止 `shell=True`，禁止任意命令和路径，运行环境只保留必要变量，不传递 OS secret。

### Catalog 同步

Quant-OS 定期同步：

- StrategyDefinition
- StrategyVersion
- FactorDefinition
- FactorVersion
- ParameterSchema
- Capability
- Source commit

同步操作幂等，不覆盖旧版本。

### 因子研究页面

因子页面按类别选择指标。

**Alpha 因子：**

- Time-Series IC
- Pooled Panel IC
- Cross-Sectional RankIC
- ICIR / RankICIR
- Rolling IC
- Decay
- Coverage
- Sign Agreement
- Quantile Return
- Long-Short Return
- Monotonicity
- Turnover
- Regime Stability
- Symbol Stability
- Cost Sensitivity

**市场状态：**

- State coverage
- State duration
- Transition stability
- Conditional expectancy
- Conditional PnL / MDD
- Filter pass rate
- False-positive reduction

**风险变量：**

- MAE distribution
- Stop utilization
- Liquidation reduction
- Margin utilization
- Drawdown reduction
- Tail loss
- Leverage sensitivity

**执行质量：**

- Fee impact
- Slippage impact
- Latency sensitivity
- Partial-fill impact
- Missed-fill rate
- Protection-delay loss

当前多资产策略只有少量大型币种，因此单日 Cross-Sectional RankIC 必须显示样本量警告，不能作为唯一晋级依据。V0.3 的短周期事件信号则优先展示 Forward Return、Hit Rate、Expectancy、MAE、MFE、Signal Decay 和 Fee-adjusted Return。

### 因子实验工作台

用户可以：

```text
复制现有因子配置
→ 填写预注册假设
→ 修改白名单参数
→ 选择 development dataset
→ 选择 Forward Return horizon
→ 创建 FactorExperiment
→ 运行 FactorRun
→ 对比 baseline
```

旧 FactorVersion 不会被覆盖。

### 策略实验工作台

用户可以：

```text
复制 StrategyInstance
→ 填写预注册假设
→ 修改白名单参数
→ 选择执行压力场景
→ 选择杠杆研究场景
→ 创建 StrategyExperiment
→ 运行 BacktestRun
→ 查看结果并对比 baseline
```

Quant-OS 不允许在浏览器中直接编辑和执行 Python 策略代码。策略逻辑修改仍然必须在 Quant-Trade 中通过 Git commit 创建新的 StrategyVersion。

### 回测中心

核心指标：

- PnL
- Total Return
- MDD
- Win Rate
- ProfitFactor
- Trade Count
- Fees
- Funding
- Liquidation Count
- Margin Utilization

核心图表：

- 连续 MTM equity
- Drawdown
- Symbol PnL
- Side PnL
- Monthly PnL
- Regime PnL
- MAE / MFE
- Leverage sensitivity
- Stress scenario comparison

页面必须明确显示：

- 当前结果是否仅属于 development。
- Lockbox 是否未打开。
- `execution_eligible` 状态。
- 10x / 20x 是否仅为压力研究。
- MTM 是否使用简化模型。
- 指标是否 unavailable。
- RankIC 是否样本不足。

### 第二阶段验收标准

- Quant-OS 可以同步 Quant-Trade catalog。
- 可以创建一次 FactorExperiment。
- 可以创建一次 StrategyExperiment。
- Celery 能调用固定 Research CLI。
- Run artifact 可以自动校验和导入。
- 因子、策略、回测页面使用真实数据。
- 失败实验保留且不可覆盖。
- 浏览器不能提交任意 Python 或 shell 命令。
- OS 不持有 Binance 交易凭证。
- 没有实现任何交易执行功能。

## 第三阶段：端到端验证

第一轮端到端验证只使用 development 数据和小型固定 fixture。

### FactorExperiment 验证

```text
同步因子目录
→ 选择一个已有因子
→ 创建预注册
→ 修改一个允许研究的参数
→ 运行 FactorExperiment
→ 导入 FactorRun
→ 查看 Decay / Stability / Forward Return
→ 与 baseline 比较
```

### StrategyExperiment 验证

```text
同步策略目录
→ 复制一个 StrategyInstance
→ 创建预注册
→ 选择 BASELINE 与 COST_2X
→ 选择 2x 与 5x
→ 运行 StrategyExperiment
→ 导入 BacktestRun
→ 查看 MTM / MAE / MFE / Diagnostics
→ 与 baseline 比较
```

### 安全验证

- 请求不能访问 lockbox。
- 请求不能指定任意 executable。
- 请求不能注入 shell。
- 请求不能越过参数范围。
- 请求不能提高风险硬限制。
- V0.9 不能进入 Demo 或 Live。
- 相同请求幂等。
- 相同 run_id 内容冲突必须拒绝。

## 第四阶段：研究治理

Quant-OS 不只是结果展示工具，还必须限制过拟合。

每次实验必须绑定：

- Hypothesis
- Expected mechanism
- Primary metric
- Constraint metrics
- Parameter set
- Trial budget
- Development dataset
- Source commit
- Artifact lineage

系统禁止：

- 删除失败实验。
- 只保存最佳参数。
- 自动按最高 PnL 晋级。
- 自动打开 lockbox。
- 自动修改 execution eligibility。
- AI 自动发起实验。
- OS 自动修改或合并 Quant-Trade 代码。

## 第五阶段：Shadow 与 Demo

只有以下条件全部满足后，才讨论 Shadow 和 Demo 的统一管理：

1. Research 与 Runtime 使用同一个 StrategyPort。
2. Replay、Shadow、Demo 的策略行为一致。
3. BacktestRun 可以完整复现。
4. 连续 MTM equity 完整。
5. Symbol-level leverage 与 margin mode 统一。
6. 执行压力测试通过。
7. Development gate 通过。
8. 一次性 lockbox 通过。
9. Demo safety gate 通过。

即使进入该阶段，Quant-OS 初期也只查看和启动受控 Shadow，不直接开放 Live 下单。

## 冻结的安全底线

- V0.9 继续保持 research-only。
- 当前不打开 lockbox。
- 当前不启用主网。
- 当前不自动晋级策略。
- AI 不进入交易关键路径。
- 两个仓库不合并。
- Quant-OS 不持有交易凭证。
- 浏览器不能执行任意代码。
- 所有实验不可变、可追溯。
- 失败结果必须保留。

## 实施顺序

```text
1. Quant-Trade：feature/research-integration-v1
2. 人工检查策略 parity、安全边界和测试
3. Quant-OS：feature/research-workbench-v1
4. 完成一次 FactorExperiment
5. 完成一次 StrategyExperiment
6. 检查 artifact lineage 与实验治理
7. 再决定是否合并到 main
```

当前阶段只建设到 FactorRun、BacktestRun 和研究可视化。先证明结果可信、流程可复现、实验不越权，再讨论真实交易。