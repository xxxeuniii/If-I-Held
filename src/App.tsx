import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { TrendingDown, TrendingUp, Calculator, BarChart3, Share2, Sparkles } from "lucide-react";

type Result = {
  symbol: string;
  stockName?: string;
  currency: string;
  sellPrice: number;
  sellDate?: string;
  currentPrice: number;
  currentValue: number;
  sellValue: number;
  diff: number;
  returnRate: number;
  isRealTime: boolean;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  closePrice?: number;
  notFound?: boolean;
};

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
}

const mockStocks: StockInfo[] = [
  { symbol: "AAPL", name: "苹果公司", price: 190 },
  { symbol: "TSLA", name: "特斯拉", price: 240 },
  { symbol: "MSFT", name: "微软", price: 420 },
  { symbol: "GOOGL", name: "谷歌", price: 141 },
  { symbol: "META", name: "Meta", price: 505 },
  { symbol: "NVDA", name: "英伟达", price: 875 },
  { symbol: "600519", name: "贵州茅台", price: 1680 },
  { symbol: "000858", name: "五粮液", price: 148 },
  { symbol: "601318", name: "中国平安", price: 48 },
  { symbol: "600036", name: "招商银行", price: 32 },
  { symbol: "000001", name: "平安银行", price: 12 },
  { symbol: "600000", name: "浦发银行", price: 8 },
  { symbol: "300750", name: "宁德时代", price: 215 },
  { symbol: "000333", name: "美的集团", price: 58 },
  { symbol: "002594", name: "比亚迪", price: 185 },
  { symbol: "601899", name: "紫金矿业", price: 15 },
  { symbol: "600703", name: "三安光电", price: 28 },
];

const loadingMessages = [
  "正在连接行情数据...",
  "正在回放你的交易记忆...",
  "正在计算错过的机会成本...",
  "正在生成情绪伤害报告...",
];

const getRegretRemark = (returnRate: number): string => {
  if (returnRate >= 5) {
    const remarks = [
      "建议卸载软件，立地成佛。",
      "巴菲特看了都沉默，芒格看了想打人。",
      "这已经不是割肉了，是截肢。",
      "你卖掉的不是股票，是未来的财务自由。",
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  }
  if (returnRate >= 1) {
    const remarks = [
      "这笔钱够你在马尔代夫躺一周。",
      "你亲手送走了一台 iPhone 15 Pro Max。",
      "建议改名：早知道就不卖了有限公司。",
      "这顿饭你请了全市场，大气！",
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  }
  if (returnRate >= 0.5) {
    const remarks = [
      "早起的鸟儿有虫吃，早卖的韭菜……也还行。",
      "差一点就能财务自由了，就差亿点点。",
      "如果再坚持一下，现在已经在数钱了。",
      "这波操作，巴菲特直呼内行。",
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  }
  if (returnRate >= 0.2) {
    const remarks = [
      "市场：谢谢你提前下车。",
      "这波属于看着账户默默流泪。",
      "如果坚持住，K线会给你一个拥抱。",
      "你和利润之间，只差一个'再等等'。",
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  }
  if (returnRate >= 0) {
    const remarks = [
      "小亏当赢，心态要好。",
      "至少没亏完，安慰一下。",
      "下次记得再等等。",
      "盈亏同源，这次算缘分未到。",
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  }
  if (returnRate >= -0.2) {
    const remarks = [
      "这次卖得确实果断，躲过一劫。",
      "你这不是止盈，是战术撤退。",
      "交易纪律在线，点赞。",
      "虽然没赚到后续，但也没被反杀。",
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  }
  const remarks = [
    "高手！精准逃顶！",
    "这操作，机构看了都要鼓掌。",
    "完美！教科书级别的止盈。",
    "恭喜你，成功避开了深坑。",
  ];
  return remarks[Math.floor(Math.random() * remarks.length)];
};



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
  const iphones = Math.floor(absDiff / 999);
  const maldivesDays = Math.floor(absDiff / 200);
  const ps5 = Math.floor(absDiff / 500);
  const flights = Math.floor(absDiff / 800);
  return { milkTea, burgers, tickets, iphones, maldivesDays, ps5, flights };
};

export default function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState(10);
  const [sellPrice, setSellPrice] = useState(100);
  const [sellDate, setSellDate] = useState("");
  const [useDateMode, setUseDateMode] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const [calcCount, setCalcCount] = useState(0);
  

  const formatStockSymbol = (symbol: string): string => {
    const upperSymbol = symbol.toUpperCase().trim();
    
    if (upperSymbol.includes('.SS') || upperSymbol.includes('.SZ')) {
      return upperSymbol;
    }
    
    if (/^\d{6}$/.test(upperSymbol)) {
      const prefix = upperSymbol.substring(0, 1);
      if (prefix === '6' || prefix === '5') {
        return `${upperSymbol}.SS`;
      } else {
        return `${upperSymbol}.SZ`;
      }
    }
    
    return upperSymbol;
  };

  const isChineseStock = (symbol: string): boolean => {
    const upper = symbol.toUpperCase();
    return upper.includes('.SS') || upper.includes('.SZ') || /^\d{6}$/.test(upper);
  };

  const getStockCurrency = (symbol: string): string => {
    return isChineseStock(symbol) ? '¥' : '$';
  };

  const fetchCurrentPrice = async (stockSymbol: string): Promise<{ price: number; isRealTime: boolean; open?: number; high?: number; low?: number; close?: number; name?: string; currency?: string; notFound?: boolean }> => {
    const formattedSymbol = formatStockSymbol(stockSymbol);
    const currency = getStockCurrency(stockSymbol);
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?region=US&lang=en-US&includePrePost=false&interval=1d&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`;
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`;
    
    try {
      const response = await axios.get(corsProxyUrl, { timeout: 15000 });
      
      if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
        console.log('Yahoo Finance API response is empty');
        throw new Error('Empty response');
      }
      
      const meta = response.data.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      
      if (typeof price === 'number' && price > 0) {
        let name = meta.shortName || meta.longName;
        
        if (isChineseStock(stockSymbol)) {
          const mockStock = mockStocks.find(s => s.symbol === stockSymbol || s.symbol === formattedSymbol);
          if (mockStock && mockStock.name && !mockStock.name.includes('CO.') && !mockStock.name.includes('LTD')) {
            name = mockStock.name;
          }
        }
        
        return { 
          price, 
          isRealTime: true,
          open: meta.regularMarketOpen,
          high: meta.dayHigh,
          low: meta.dayLow,
          close: meta.regularMarketPreviousClose,
          name,
          currency
        };
      } else {
        console.log('Price is not valid:', price);
      }
    } catch (error) {
      console.log('Yahoo Finance API error:', (error as Error).message);
    }

    const stock = mockStocks.find(s => s.symbol === stockSymbol);
    if (stock) {
      return { price: stock.price, isRealTime: false, name: stock.name, currency };
    }
    
    const dotSymbol = stockSymbol.includes('.') ? stockSymbol : `${stockSymbol}.SS`;
    const dotStock = mockStocks.find(s => s.symbol === dotSymbol);
    if (dotStock) {
      return { price: dotStock.price, isRealTime: false, name: dotStock.name, currency };
    }

    return { price: 0, isRealTime: false, currency, notFound: true };
  };

  const fetchHistoricalPrice = async (stockSymbol: string, date: string): Promise<number | null> => {
    try {
      const timestamp = new Date(date).getTime() / 1000;
      const formattedSymbol = formatStockSymbol(stockSymbol);
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?region=US&lang=en-US&includePrePost=false&interval=1d&useYfid=true&range=max&corsDomain=finance.yahoo.com&.tsrc=finance`;
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`;
      const response = await axios.get(corsProxyUrl, { timeout: 15000 });
      const timestamps = response.data.chart.result[0].timestamp;
      const closes = response.data.chart.result[0].indicators.quote[0].close;
      
      let closestIdx = 0;
      let minDiff = Math.abs(timestamps[0] - timestamp);
      for (let i = 1; i < timestamps.length; i++) {
        const diff = Math.abs(timestamps[i] - timestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      
      return closes[closestIdx] || null;
    } catch (error) {
      console.log('Fetch historical price failed:', error);
      return null;
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setLoadingText(loadingMessages[0]);
    
    let effectiveSellPrice = sellPrice;
    
    if (useDateMode && sellDate) {
      const historicalPrice = await fetchHistoricalPrice(symbol, sellDate);
      if (historicalPrice !== null) {
        effectiveSellPrice = historicalPrice;
      } else {
        alert('无法获取该日期的历史价格，请检查股票代码或选择其他日期');
        setIsLoading(false);
        return;
      }
    }
    
    const { price: currentPrice, isRealTime, open, high, low, close, name, currency, notFound } = await fetchCurrentPrice(symbol);

    if (notFound) {
      setResult({
        symbol,
        stockName: undefined,
        currency: currency || (isChineseStock(symbol) ? '¥' : '$'),
        sellPrice: effectiveSellPrice,
        sellDate: useDateMode ? sellDate : undefined,
        currentPrice: 0,
        currentValue: 0,
        sellValue: 0,
        diff: 0,
        returnRate: 0,
        isRealTime: false,
        notFound: true,
      });
      setCalcCount((prev) => prev + 1);
      setIsLoading(false);
      return;
    }

    const sellValue = effectiveSellPrice * quantity;
    const currentValue = currentPrice * quantity;
    const diff = currentValue - sellValue;
    const returnRate = diff / sellValue;

    setResult({
      symbol,
      stockName: name,
      currency: currency || (isChineseStock(symbol) ? '¥' : '$'),
      sellPrice: effectiveSellPrice,
      sellDate: useDateMode ? sellDate : undefined,
      currentPrice,
      currentValue,
      sellValue,
      diff,
      returnRate,
      isRealTime,
      openPrice: open,
      highPrice: high,
      lowPrice: low,
      closePrice: close,
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
    return getRegretRemark(result.returnRate);
  }, [result]);

  const handleShare = async (result: Result, regretInfo: ReturnType<typeof getRegretLevel>) => {
    const trendIcon = regretInfo.Icon === TrendingUp ? "📈" : "📉";
    const shareText = `【早知道就不卖了】\n\n${result.symbol} 复盘报告\n${trendIcon} ${regretInfo.level}\n\n卖出价: ${result.currency}${result.sellPrice}\n现价: ${result.currency}${result.currentPrice.toFixed(2)}\n差额: ${result.diff >= 0 ? "+" : ""}${result.currency}${result.diff.toFixed(2)}\n收益率: ${(result.returnRate * 100).toFixed(2)}%\n\n${remark}`;
    
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "8px" }}>
            <TrendingDown style={{ width: 24, height: 24, color: "#ef4444", flexShrink: 0 }} />
            <h1 style={{ ...styles.title, margin: "0 0 12px 0", lineHeight: "24px" }}>早知道就不卖了</h1>
          </div>
          <p style={styles.subtitle}>If I Held Calculator</p>
          <p style={styles.subHint}>复盘不一定赚钱，但一定有故事。</p>

          <div style={styles.formGroup}>
            <label htmlFor="stock-symbol" style={styles.label}>股票代码</label>
            <input
              id="stock-symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              style={styles.input}
              placeholder="输入股票代码，如 AAPL、600519（茅台）、000858（五粮液）"
            />
            <span style={{ ...styles.smallHint, textAlign: "left", marginTop: "8px", display: "block" }}>支持 A 股（6 开头上交所，0/3 开头深交所）</span>
            <span style={{ ...styles.smallHint, textAlign: "left", marginTop: "4px", display: "block" }}>支持美股代码：AAPL / TSLA / MSFT / GOOGL / META / NVDA</span>
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
            <div style={styles.modeToggle}>
              <button
                onClick={() => {
                  setUseDateMode(false);
                }}
                style={{
                  ...styles.modeButton,
                  backgroundColor: !useDateMode ? "#2563eb" : "#f1f5f9",
                  color: !useDateMode ? "#fff" : "#64748b",
                }}
              >
                输入价格
              </button>
              <button
                onClick={() => {
                  setUseDateMode(true);
                }}
                style={{
                  ...styles.modeButton,
                  backgroundColor: useDateMode ? "#2563eb" : "#f1f5f9",
                  color: useDateMode ? "#fff" : "#64748b",
                }}
              >
                选择日期
              </button>
            </div>
          </div>

          {!useDateMode ? (
            <div style={styles.formGroup}>
              <label htmlFor="sell-price" style={styles.label}>卖出价格</label>
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
          ) : (
            <div style={styles.formGroup}>
              <label htmlFor="sell-date" style={styles.label}>卖出日期</label>
              <input
                id="sell-date"
                type="date"
                value={sellDate}
                onChange={(e) => setSellDate(e.target.value)}
                style={styles.input}
                max={new Date().toISOString().split('T')[0]}
              />
              <p style={styles.smallHint}>选择卖出日期，系统将自动获取当天收盘价</p>
            </div>
          )}

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

        <div style={styles.middlePanel}>
          {result ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "20px" }}>
                <Sparkles style={{ width: 24, height: 24, color: "#1E90FF", flexShrink: 0 }} />
                <h2 style={{ ...styles.resultTitle, margin: 0, lineHeight: "24px" }}>股票信息</h2>
              </div>
              
              {result.notFound ? (
                <div style={{ ...styles.stockInfo, borderColor: "#ef4444", background: "#fef2f2", padding: "20px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#ef4444" }}>没有这只股票</span>
                  <span style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>股票代码 {result.symbol} 不存在或无法查询</span>
                </div>
              ) : (
                <>
                  <div style={styles.stockInfo}>
                    <span style={styles.stockSymbol}>{result.symbol}</span>
                    {result.stockName && <span style={styles.stockName}>{result.stockName}</span>}
                  </div>
                  
                  <div style={{ ...styles.resultGrid, textAlign: "left" }}>
                    <div style={{ ...styles.resultItem, display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                      <span style={styles.resultLabel}>当前价格</span>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={styles.resultValue}>{result.currency}{result.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{ ...styles.resultItem, textAlign: "left" }}>
                      <span style={styles.resultLabel}>卖出价值</span>
                      <span style={styles.resultValue}>{result.currency}{result.sellValue.toFixed(2)}</span>
                    </div>
                    <div style={{ ...styles.resultItem, textAlign: "left" }}>
                      <span style={styles.resultLabel}>现在价值</span>
                      <span style={styles.resultValue}>{result.currency}{result.currentValue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={styles.priceStats}>
                    <h4 style={styles.priceStatsTitle}>今日行情</h4>
                    <div style={styles.priceStatsGrid}>
                      <div style={styles.priceStatItem}>
                        <span style={styles.priceStatLabel}>开盘</span>
                        <span style={styles.priceStatValue}>{result.currency}{result.openPrice?.toFixed(2) || "-"}</span>
                      </div>
                      <div style={styles.priceStatItem}>
                        <span style={styles.priceStatLabel}>收盘</span>
                        <span style={styles.priceStatValue}>{result.currency}{result.closePrice?.toFixed(2) || "-"}</span>
                      </div>
                      <div style={styles.priceStatItem}>
                        <span style={styles.priceStatLabel}>最高</span>
                        <span style={{ ...styles.priceStatValue, color: "#ef4444" }}>{result.currency}{result.highPrice?.toFixed(2) || "-"}</span>
                      </div>
                      <div style={styles.priceStatItem}>
                        <span style={styles.priceStatLabel}>最低</span>
                        <span style={{ ...styles.priceStatValue, color: "#22c55e" }}>{result.currency}{result.lowPrice?.toFixed(2) || "-"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!result.notFound && result.sellDate && (
                <div style={{ ...styles.priceStats, marginTop: "16px" }}>
                  <h4 style={styles.priceStatsTitle}>卖出日期</h4>
                  <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#ffffff", borderRadius: "0", border: "2px solid #1E90FF", boxShadow: "2px 2px 0 #006994" }}>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "#006994" }}>{result.sellDate}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#4A90A4" }}>
              <BarChart3 style={{ width: 48, height: 48, marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ fontSize: "12px", textAlign: "center" }}>输入股票代码并计算后<br/>将显示股票信息</p>
            </div>
          )}
        </div>

        <div style={styles.rightPanel}>
          {result ? (
            <div style={styles.resultSection}>
              <div style={{ ...styles.flavorBanner, backgroundColor: `${regretInfo?.color}20`, color: regretInfo?.color }}>
                {regretInfo?.Icon && <regretInfo.Icon style={{ width: 18, height: 18, display: "inline", marginRight: 6 }} />} {remark}
              </div>

              <div style={{ ...styles.diffBox, boxShadow: `inset 0 0 0 1px ${regretInfo?.color}40` }}>
                <span style={styles.diffLabel}>差额</span>
                <span style={{ ...styles.diffValue, color: regretInfo?.color }}>
                  {result.diff >= 0 ? "+" : ""}{result.currency}{result.diff.toFixed(2)}
                </span>
              </div>

              <div style={styles.returnRateBox}>
                <span style={styles.returnLabel}>收益率</span>
                <span style={{ ...styles.returnValue, color: regretInfo?.color }}>
                  {(result.returnRate * 100).toFixed(2)}%
                </span>
              </div>

              <div style={{ ...styles.regretBox, backgroundColor: regretInfo?.color + "20" }}>
                {regretInfo?.Icon && <regretInfo.Icon style={{ width: 32, height: 32, marginRight: 8, color: regretInfo.color }} />}
                <span style={{ ...styles.regretLevel, color: regretInfo?.color }}>
                  {regretInfo?.level}
                </span>
              </div>

              <div style={styles.funStats}>
                {opportunityHint && opportunityHint.milkTea > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>相当于错失了</span>
                    <span style={styles.funStatValue}>{opportunityHint.milkTea} 杯奶茶</span>
                  </div>
                )}
                {opportunityHint && opportunityHint.burgers > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>相当于错失了</span>
                    <span style={styles.funStatValue}>{opportunityHint.burgers} 个汉堡</span>
                  </div>
                )}
                {opportunityHint && opportunityHint.tickets > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>相当于错失了</span>
                    <span style={styles.funStatValue}>{opportunityHint.tickets} 张电影票</span>
                  </div>
                )}
                {opportunityHint && opportunityHint.iphones > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>相当于错失了</span>
                    <span style={styles.funStatValue}>{opportunityHint.iphones} 台 iPhone</span>
                  </div>
                )}
                {opportunityHint && opportunityHint.maldivesDays > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>这笔钱够你在</span>
                    <span style={styles.funStatValue}>马尔代夫躺 {opportunityHint.maldivesDays} 天</span>
                  </div>
                )}
                {opportunityHint && opportunityHint.ps5 > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>相当于错失了</span>
                    <span style={styles.funStatValue}>{opportunityHint.ps5} 台 PS5</span>
                  </div>
                )}
                {opportunityHint && opportunityHint.flights > 0 && (
                  <div style={styles.funStatItem}>
                    <span style={styles.funStatLabel}>相当于错失了</span>
                    <span style={styles.funStatValue}>{opportunityHint.flights} 张国际机票</span>
                  </div>
                )}
              </div>

              <p style={styles.emotionText}>
                {result.diff > 0 ? (
                  <span><TrendingDown style={{ width: 18, height: 18, display: "inline", marginRight: 4, color: "#ef4444" }} /> 你少赚了 <strong>{result.currency}{result.diff.toFixed(2)}</strong>，相当于错过了</span>
                ) : (
                  <span><TrendingUp style={{ width: 18, height: 18, display: "inline", marginRight: 4, color: "#22c55e" }} /> 你卖得挺好，成功避免了 <strong>{result.currency}{Math.abs(result.diff).toFixed(2)}</strong> 的损失</span>
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
      
      <footer style={{ 
        textAlign: "center", 
        padding: "12px", 
        fontSize: "12px", 
        color: "#6b7280", 
        background: "#ffffff",
        borderTop: "2px solid #1E90FF",
      }}>
        仅供娱乐，不构成投资建议
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    margin: "0",
    background: "#E0F4FF",
    width: "100%",
  },
  card: {
    background: "#ffffff",
    borderRadius: "0",
    padding: "0",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "row",
    boxSizing: "border-box",
    margin: "0",
  },
  leftPanel: {
    width: "340px",
    padding: "30px",
    borderRight: "2px solid #1E90FF",
    display: "flex",
    flexDirection: "column",
    background: "#E0F4FF",
    boxSizing: "border-box",
    minHeight: "100vh",
  },
  middlePanel: {
    width: "520px",
    padding: "30px",
    borderRight: "2px solid #1E90FF",
    display: "flex",
    flexDirection: "column",
    background: "#F0F8FF",
    boxSizing: "border-box",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    minHeight: "100vh",
  },
  rightPanel: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
    maxHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    boxSizing: "border-box",
    minWidth: "380px",
    minHeight: "100vh",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1E90FF",
    margin: "0 0 12px 0",
    textAlign: "center",
    textShadow: "2px 2px 0 #00008B",
  },
  subtitle: {
    fontSize: "14px",
    color: "#006994",
    textAlign: "center",
    margin: "0 0 20px 0",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  subHint: {
    margin: "-10px 0 20px 0",
    fontSize: "12px",
    color: "#4A90A4",
    textAlign: "center",
  },
  smallHint: {
    fontSize: "11px",
    color: "#4A90A4",
    textAlign: "center",
    margin: "8px 0 0 0",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#006994",
    marginBottom: "8px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "0",
    border: "3px solid #1E90FF",
    backgroundColor: "#ffffff",
    color: "#006994",
    fontSize: "16px",
    outline: "none",
    transition: "box-shadow 0.2s ease",
    boxShadow: "3px 3px 0 #006994",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "0",
    border: "3px solid #1E90FF",
    backgroundColor: "#ffffff",
    color: "#006994",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    boxShadow: "3px 3px 0 #006994",
    boxSizing: "border-box",
  },
  modeToggle: {
    display: "flex",
    gap: "8px",
  },
  modeButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "0",
    border: "3px solid #1E90FF",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "3px 3px 0 #006994",
    transition: "transform 0.1s ease",
  },
  button: {
    width: "100%",
    padding: "18px",
    borderRadius: "0",
    border: "3px solid #006994",
    backgroundColor: "#1E90FF",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
    marginTop: "10px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  resultSection: {
    marginTop: "10px",
    paddingTop: "0",
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
  stockInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "16px",
    padding: "12px",
    background: "#E0F4FF",
    borderRadius: "0",
    border: "2px solid #1E90FF",
    boxShadow: "2px 2px 0 #006994",
  },
  stockSymbol: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#006994",
  },
  stockName: {
    fontSize: "14px",
    color: "#4A90A4",
    marginTop: "4px",
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
    fontSize: "20px",
    fontWeight: "bold",
    color: "#006994",
  },
  diffBox: {
    background: "#E0F4FF",
    borderRadius: "0",
    border: "3px solid #1E90FF",
    padding: "24px",
    textAlign: "center",
    marginBottom: "16px",
    boxShadow: "3px 3px 0 #006994",
  },
  diffLabel: {
    display: "block",
    fontSize: "16px",
    color: "#006994",
    marginBottom: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  diffValue: {
    fontSize: "40px",
    fontWeight: "bold",
  },
  returnRateBox: {
    background: "#E0F4FF",
    borderRadius: "0",
    border: "3px solid #1E90FF",
    padding: "20px",
    textAlign: "center",
    marginBottom: "16px",
    boxShadow: "3px 3px 0 #006994",
  },
  funStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  funStatItem: {
    backgroundColor: "#E0F4FF",
    borderRadius: "0",
    border: "2px solid #1E90FF",
    textAlign: "center",
    padding: "14px 10px",
    boxShadow: "2px 2px 0 #006994",
  },
  funStatLabel: {
    display: "block",
    fontSize: "12px",
    color: "#4A90A4",
    marginBottom: "4px",
  },
  funStatValue: {
    fontSize: "16px",
    color: "#006994",
    fontWeight: "bold",
  },
  priceStats: {
    backgroundColor: "#E0F4FF",
    borderRadius: "0",
    border: "3px solid #1E90FF",
    padding: "20px",
    boxShadow: "3px 3px 0 #006994",
    marginBottom: "16px",
  },
  priceStatsTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#006994",
    margin: "0 0 14px 0",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  priceStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },
  priceStatItem: {
    textAlign: "center",
    backgroundColor: "#ffffff",
    borderRadius: "0",
    border: "2px solid #1E90FF",
    padding: "12px 6px",
    boxShadow: "2px 2px 0 #006994",
  },
  priceStatLabel: {
    display: "block",
    fontSize: "12px",
    color: "#4A90A4",
    marginBottom: "6px",
    fontWeight: "bold",
  },
  priceStatValue: {
    fontSize: "18px",
    color: "#006994",
    fontWeight: "bold",
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
