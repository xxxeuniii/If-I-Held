import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { TrendingDown, TrendingUp, Calculator, BarChart3, Share2, Sparkles } from "lucide-react";

type Result = {
  symbol: string;
  sellPrice: number;
  currentPrice: number;
  currentValue: number;
  sellValue: number;
  diff: number;
  returnRate: number;
  isRealTime: boolean;
};

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
}

const mockStocks: StockInfo[] = [
  { symbol: "AAPL", name: "苹果", price: 190 },
  { symbol: "TSLA", name: "特斯拉", price: 240 },
  { symbol: "MSFT", name: "微软", price: 420 },
  { symbol: "GOOGL", name: "谷歌", price: 141 },
  { symbol: "META", name: "Meta", price: 505 },
  { symbol: "NVDA", name: "英伟达", price: 875 },
];

const loadingMessages = [
  "正在连接行情数据...",
  "正在回放你的交易记忆...",
  "正在计算错过的机会成本...",
  "正在生成情绪伤害报告...",
];

const positiveRemarks = [
  "市场：谢谢你提前下车。",
  "这波属于看着账户默默流泪。",
  "如果坚持住，K线会给你一个拥抱。",
  "你和利润之间，只差一个'再等等'。",
];

const negativeRemarks = [
  "这次卖得确实果断，躲过一劫。",
  "你这不是止盈，是战术撤退。",
  "交易纪律在线，点赞。",
  "虽然没赚到后续，但也没被反杀。",
];

const getRegretLevel = (returnRate: number): { level: string; Icon: React.ComponentType<{ style?: React.CSSProperties }>; color: string } => {
  if (returnRate >= 5) return { level: "交易人生阴影", Icon: TrendingDown, color: "#ff0000" };
  if (returnRate >= 1) return { level: "心碎", Icon: TrendingDown, color: "#ff4757" };
  if (returnRate >= 0.5) return { level: "有点痛", Icon: TrendingDown, color: "#ff6b6b" };
  if (returnRate >= 0.2) return { level: "还好", Icon: TrendingDown, color: "#ffa502" };
  if (returnRate >= 0) return { level: "小遗憾", Icon: TrendingDown, color: "#ffd43b" };
  if (returnRate >= -0.2) return { level: "卖得不错", Icon: TrendingUp, color: "#7bed9f" };
  return { level: "明智之举", Icon: TrendingUp, color: "#2ed573" };
};

const getOpportunityHint = (diff: number) => {
  const absDiff = Math.abs(diff);
  const milkTea = Math.floor(absDiff / 4.5);
  const burgers = Math.floor(absDiff / 12);
  const tickets = Math.floor(absDiff / 80);
  return { milkTea, burgers, tickets };
};

export default function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState(10);
  const [sellPrice, setSellPrice] = useState(100);
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const [calcCount, setCalcCount] = useState(0);

  const fetchCurrentPrice = async (stockSymbol: string): Promise<{ price: number; isRealTime: boolean }> => {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?region=US&lang=en-US&includePrePost=false&interval=1m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`
      );
      const price = response.data.chart.result[0].meta.regularMarketPrice;
      if (typeof price === 'number') {
        return { price, isRealTime: true };
      }
    } catch {
      console.log('Yahoo Finance API failed, using fallback price');
    }

    const stock = mockStocks.find(s => s.symbol === stockSymbol);
    return { price: stock?.price || 100, isRealTime: false };
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setLoadingText(loadingMessages[0]);
    const { price: currentPrice, isRealTime } = await fetchCurrentPrice(symbol);

    const sellValue = sellPrice * quantity;
    const currentValue = currentPrice * quantity;
    const diff = currentValue - sellValue;
    const returnRate = diff / sellValue;

    setResult({
      symbol,
      sellPrice,
      currentPrice,
      currentValue,
      sellValue,
      diff,
      returnRate,
      isRealTime,
    });
    setCalcCount((prev) => prev + 1);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoading) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[idx]);
    }, 650);
    return () => clearInterval(timer);
  }, [isLoading]);

  const regretInfo = result ? getRegretLevel(result.returnRate) : null;
  const opportunityHint = result ? getOpportunityHint(result.diff) : null;
  const remark = useMemo(() => {
    if (!result) return "";
    const pool = result.diff >= 0 ? positiveRemarks : negativeRemarks;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [result]);

  const handleShare = async (result: Result, regretInfo: ReturnType<typeof getRegretLevel>) => {
    const trendIcon = regretInfo.Icon === TrendingUp ? "📈" : "📉";
    const shareText = `【早知道就不卖了】\n\n${result.symbol} 复盘报告\n${trendIcon} ${regretInfo.level}\n\n卖出价: $${result.sellPrice}\n现价: $${result.currentPrice.toFixed(2)}\n差额: ${result.diff >= 0 ? "+" : ""}$${result.diff.toFixed(2)}\n收益率: ${(result.returnRate * 100).toFixed(2)}%\n\n${remark}`;
    
    if (navigator.share) {
      await navigator.share({
        title: "早知道就不卖了",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("报告已复制到剪贴板！");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.leftPanel}>
          <div style={styles.titleWrapper}>
            <TrendingDown style={{ width: 32, height: 32, color: "#ef4444" }} />
            <h1 style={styles.title}>早知道就不卖了</h1>
          </div>
          <p style={styles.subtitle}>If I Held Calculator</p>
          <p style={styles.subHint}>复盘不一定赚钱，但一定有故事。</p>

          <div style={styles.formGroup}>
            <label htmlFor="stock-symbol" style={styles.label}>股票代码</label>
            <select
              id="stock-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              style={styles.select}
            >
              {mockStocks.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="sell-quantity" style={styles.label}>卖出数量（股）</label>
            <input
              id="sell-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              style={styles.input}
              min="1"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="sell-price" style={styles.label}>卖出价格（美元）</label>
            <input
              id="sell-price"
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(Math.max(0.01, Number(e.target.value)))}
              style={styles.input}
              min="0.01"
              step="0.01"
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.85 : 1,
              transform: isLoading ? "scale(0.99)" : "scale(1)",
            }}
          >
            {isLoading ? (
              <span>{loadingText}</span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Calculator style={{ width: 18, height: 18 }} />
                计算如果没卖
              </span>
            )}
          </button>

          <p style={styles.sessionCount}>你今天已经复盘了 {calcCount} 次</p>
        </div>

        <div style={styles.rightPanel}>
          {result ? (
            <div style={styles.resultSection}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 style={{ width: 24, height: 24, color: "#2563eb" }} />
                <h2 style={styles.resultTitle}>结果分析</h2>
              </div>
              <div style={{ ...styles.flavorBanner, backgroundColor: `${regretInfo?.color}20`, color: regretInfo?.color }}>
                {regretInfo?.Icon && <regretInfo.Icon style={{ width: 18, height: 18, display: "inline", marginRight: 6 }} />} {remark}
              </div>
              
              <div style={styles.resultGrid}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>当前价格</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={styles.resultValue}>${result.currentPrice.toFixed(2)}</span>
                    {result.isRealTime ? (
                      <span style={styles.realTimeBadge}>实时</span>
                    ) : (
                      <span style={styles.fallbackBadge}>参考</span>
                    )}
                  </div>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>卖出价值</span>
                  <span style={styles.resultValue}>${result.sellValue.toFixed(2)}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>现在价值</span>
                  <span style={styles.resultValue}>${result.currentValue.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ ...styles.diffBox, boxShadow: `inset 0 0 0 1px ${regretInfo?.color}40` }}>
                <span style={styles.diffLabel}>差额</span>
                <span style={{ ...styles.diffValue, color: regretInfo?.color }}>
                  {result.diff >= 0 ? "+" : ""}${result.diff.toFixed(2)}
                </span>
              </div>

              <div style={styles.returnRateBox}>
                <span style={styles.returnLabel}>收益率</span>
                <span style={{ ...styles.returnValue, color: regretInfo?.color }}>
                  {(result.returnRate * 100).toFixed(2)}%
                </span>
              </div>

              <div style={styles.funStats}>
                <div style={styles.funStatItem}>
                  <span style={styles.funStatLabel}>≈ 奶茶</span>
                  <span style={styles.funStatValue}>{opportunityHint?.milkTea} 杯</span>
                </div>
                <div style={styles.funStatItem}>
                  <span style={styles.funStatLabel}>≈ 汉堡</span>
                  <span style={styles.funStatValue}>{opportunityHint?.burgers} 个</span>
                </div>
                <div style={styles.funStatItem}>
                  <span style={styles.funStatLabel}>≈ 电影票</span>
                  <span style={styles.funStatValue}>{opportunityHint?.tickets} 张</span>
                </div>
              </div>

              <div style={{ ...styles.regretBox, backgroundColor: regretInfo?.color + "20" }}>
                {regretInfo?.Icon && <regretInfo.Icon style={{ width: 32, height: 32, marginRight: 8, color: regretInfo.color }} />}
                <span style={{ ...styles.regretLevel, color: regretInfo?.color }}>
                  {regretInfo?.level}
                </span>
              </div>

              <p style={styles.emotionText}>
                {result.diff > 0 ? (
                  <span><TrendingDown style={{ width: 18, height: 18, display: "inline", marginRight: 4, color: "#ef4444" }} /> 你少赚了 <strong>${result.diff.toFixed(2)}</strong>，相当于错过了</span>
                ) : (
                  <span><TrendingUp style={{ width: 18, height: 18, display: "inline", marginRight: 4, color: "#22c55e" }} /> 你卖得挺好，成功避免了 <strong>${Math.abs(result.diff).toFixed(2)}</strong> 的损失</span>
                )}
              </p>

            <button
              onClick={() => handleShare(result, regretInfo!)}
              style={styles.shareButton}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Share2 style={{ width: 16, height: 16 }} />
                分享报告
              </span>
            </button>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Sparkles style={{ width: 64, height: 64, color: "#e5e7eb", marginBottom: 16 }} />
              <h3 style={styles.emptyTitle}>输入数据开始计算</h3>
              <p style={styles.emptyDesc}>填写左侧表单，看看如果你当时没卖会怎样</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #d1d5db 100%)",
  },
  card: {
    background: "#ffffff",
    borderRadius: "0",
    padding: "0",
    width: "100%",
    height: "100vh",
    minHeight: "100vh",
    boxShadow: "none",
    border: "none",
    display: "flex",
    flexDirection: "row",
  },
  leftPanel: {
    flex: 1,
    padding: "60px 40px",
    borderRight: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
  },
  rightPanel: {
    flex: 1,
    padding: "60px 40px",
    overflowY: "auto",
    maxHeight: "100vh",
    height: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666666",
    textAlign: "center",
    margin: "0 0 30px 0",
  },
  subHint: {
    margin: "-18px 0 22px 0",
    fontSize: "12px",
    color: "#8a8fa1",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#333333",
    marginBottom: "8px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
    color: "#333333",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  select: {
    width: "100%",
    padding: "14px 40px 14px 16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
    color: "#333333",
    fontSize: "16px",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  button: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
    marginTop: "10px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  resultSection: {
    marginTop: "30px",
    paddingTop: "30px",
    borderTop: "1px solid #e0e0e0",
  },
  resultTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: "0 0 20px 0",
  },
  flavorBanner: {
    fontSize: "13px",
    borderRadius: "10px",
    padding: "10px 12px",
    marginBottom: "14px",
    fontWeight: "600",
    textAlign: "center",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },
  resultItem: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "12px",
    textAlign: "center",
  },
  resultLabel: {
    display: "block",
    fontSize: "12px",
    color: "#666666",
    marginBottom: "4px",
  },
  resultValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
  },
  diffBox: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "16px",
  },
  diffLabel: {
    display: "block",
    fontSize: "14px",
    color: "#666666",
    marginBottom: "8px",
  },
  diffValue: {
    fontSize: "32px",
    fontWeight: "700",
  },
  returnRateBox: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
    marginBottom: "16px",
  },
  funStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },
  funStatItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    textAlign: "center",
    padding: "10px 8px",
  },
  funStatLabel: {
    display: "block",
    fontSize: "11px",
    color: "#6b7280",
  },
  funStatValue: {
    fontSize: "13px",
    color: "#111827",
    fontWeight: "700",
  },
  returnLabel: {
    display: "block",
    fontSize: "14px",
    color: "#666666",
    marginBottom: "4px",
  },
  returnValue: {
    fontSize: "24px",
    fontWeight: "600",
  },
  regretBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  },
  regretLevel: {
    fontSize: "20px",
    fontWeight: "600",
  },
  emotionText: {
    fontSize: "14px",
    color: "#333333",
    textAlign: "center",
    margin: "0 0 12px 0",
    lineHeight: "1.6",
  },
  carJoke: {
    fontSize: "14px",
    color: "#666666",
    textAlign: "center",
    margin: "0",
    fontStyle: "italic",
  },
  sessionCount: {
    margin: "auto 0 0 0",
    fontSize: "12px",
    color: "#7c8397",
    textAlign: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    minHeight: "400px",
    textAlign: "center",
  },
  emptyEmoji: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: "0 0 8px 0",
  },
  emptyDesc: {
    fontSize: "14px",
    color: "#666666",
    margin: 0,
  },
  shareButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #2563eb",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "16px",
  },
  realTimeBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor: "#22c55e",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "500",
    marginLeft: "8px",
  },
  fallbackBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "500",
    marginLeft: "8px",
  },
};
