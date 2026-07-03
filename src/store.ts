import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Rule, SavedLog, ThreatConfig, SecurityAlert, AIProviderConfig } from './types';

interface AppState {
  activeView: 'analyzer' | 'rules' | 'history' | 'settings';
  setActiveView: (view: 'analyzer' | 'rules' | 'history' | 'settings') => void;

  urlInput: string;
  setUrlInput: (url: string) => void;
  urlHistory: string[];
  historyIndex: number;
  pushUrlHistory: (url: string) => void;
  undoUrl: () => void;
  redoUrl: () => void;

  rules: Rule[];
  setRules: (rules: Rule[]) => void;
  addRule: (rule: Omit<Rule, 'id'>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;

  savedLogs: SavedLog[];
  saveLog: (original: string, cleaned: string) => void;
  deleteLog: (id: string) => void;
  clearLogs: () => void;

  threatConfigs: ThreatConfig[];
  updateThreatConfig: (id: string, updates: Partial<ThreatConfig>) => void;

  securityAlerts: SecurityAlert[];
  addSecurityAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissSecurityAlert: (id: string) => void;
  clearSecurityAlerts: () => void;

  aiConfig: AIProviderConfig;
  updateAiConfig: (updates: Partial<AIProviderConfig>) => void;

  resetToDefaults: () => void;
}

const DEFAULT_RULES: Rule[] = [
  { id: '1', name: 'Twitter ➔ FxTwitter', active: true, regex: '^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?(?:twitter|x)\\\\.com\\\\/(\\\\w+\\\\/status\\\\/\\\\d+)', replacement: 'https://fxtwitter.com/$1' },
  { id: '2', name: 'TikTok ➔ VxTikTok', active: true, regex: '^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?tiktok\\\\.com\\\\/(.*)', replacement: 'https://vxtiktok.com/$1' },
  { id: '3', name: 'Desviar Google Redirect', active: true, regex: '^https?:\\\\/\\\\/(?:www\\\\.)?google\\\\.[a-z.]+\\\\/url\\\\?.*q=([^&]+)', replacement: '$1', isDecode: true },
  { id: '4', name: 'Reddit ➔ Libreddit', active: true, regex: '^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?reddit\\\\.com\\\\/(.*)', replacement: 'https://libreddit.spike.codes/$1' },
  { id: '5', name: 'YouTube ➔ Invidious', active: false, regex: '^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?youtube\\\\.com\\\\/(watch\\\\?v=.*)', replacement: 'https://yewtu.be/$1' },
  { id: '6', name: 'Instagram ➔ DDInstagram', active: false, regex: '^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?instagram\\\\.com\\\\/p\\\\/([^/]+)', replacement: 'https://ddinstagram.com/p/$1' }
];

const DEFAULT_THREAT_CONFIGS: ThreatConfig[] = [
  { id: 'malware', name: 'Downloads/Malware Suspeitos', description: 'URLs que apontam para arquivos executáveis ou arquivos comprimidos perigosos (ex: .exe, .dmg, .bat, .zip, .rar).', enabled: true, priority: 'high' },
  { id: 'phishing', name: 'Tentativas de Phishing', description: 'Domínios não verificados que tentam imitar serviços e incluem caminhos como "login", "auth", "verify", "secure", "update".', enabled: true, priority: 'high' },
  { id: 'suspicious_domain', name: 'Domínios Suspeitos', description: 'Nomes de servidores com termos promocionais ou de isca como "win", "free", "gift", "update" ou com caracteres homóglifos.', enabled: true, priority: 'medium' },
  { id: 'unsecure_http', name: 'Protocolos Inseguros (HTTP)', description: 'Uso de links "http://" que transmitem dados em texto limpo sem criptografia TLS.', enabled: true, priority: 'medium' },
  { id: 'tracking_heavy', name: 'Rastreadores em Excesso', description: 'Gera alertas quando a URL de destino contém mais do que 3 parâmetros de monitorização e tracking de dados.', enabled: true, priority: 'low' },
  { id: 'url_shorteners', name: 'Encurtador de Links de Risco', description: 'Detecta se a URL usa um encurtador de link conhecido que oculta o destino final (ex: bit.ly, tinyurl.com, t.co, is.gd).', enabled: true, priority: 'medium' },
  { id: 'raw_ips', name: 'Domínio de IP Bruto', description: 'Gera alertas quando o link usa um endereço IP numérico direto em vez de um nome de domínio tradicional (ex: http://192.168.1.5).', enabled: true, priority: 'high' },
  { id: 'deep_subdomains', name: 'Subdomínios Excessivos/Aninhados', description: 'Gera alertas para domínios com subdomínios aninhados excessivos de phishing (ex: login.paypal.com-secure.web-auth.info).', enabled: true, priority: 'high' },
  { id: 'suspicious_ports', name: 'Portas Não Standard', description: 'Detecta portas incomuns ou não seguras na URL que podem ocultar canais C2 ou serviços ilegítimos (ex: :8080, :8888, :1080).', enabled: true, priority: 'medium' },
  { id: 'double_extensions', name: 'Simulação de Extensão Dupla', description: 'Detecta arquivos com extensões de arquivos em formato falso duplo projetadas para enganar utilizadores (ex: relatorio.pdf.exe).', enabled: true, priority: 'high' }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeView: 'analyzer',
      setActiveView: (view) => set({ activeView: view }),

      urlInput: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter&utm_medium=email&fbclid=XYZ123456',
      setUrlInput: (url) => set({ urlInput: url }),
      urlHistory: ['https://m.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter&utm_medium=email&fbclid=XYZ123456'],
      historyIndex: 0,
      pushUrlHistory: (url) => {
        const { urlHistory, historyIndex } = get();
        if (urlHistory[historyIndex] === url) return;
        const newHistory = urlHistory.slice(0, historyIndex + 1);
        newHistory.push(url);
        set({ urlHistory: newHistory, historyIndex: newHistory.length - 1, urlInput: url });
      },
      undoUrl: () => {
        const { urlHistory, historyIndex } = get();
        if (historyIndex > 0) {
          set({ historyIndex: historyIndex - 1, urlInput: urlHistory[historyIndex - 1] });
        }
      },
      redoUrl: () => {
        const { urlHistory, historyIndex } = get();
        if (historyIndex < urlHistory.length - 1) {
          set({ historyIndex: historyIndex + 1, urlInput: urlHistory[historyIndex + 1] });
        }
      },

      rules: DEFAULT_RULES,
      setRules: (rules) => set({ rules }),
      addRule: (rule) => set((state) => ({ rules: [...state.rules, { ...rule, id: Date.now().toString() }] })),
      toggleRule: (id) => set((state) => ({
        rules: state.rules.map(r => r.id === id ? { ...r, active: !r.active } : r)
      })),
      deleteRule: (id) => set((state) => ({
        rules: state.rules.filter(r => r.id !== id)
      })),

      savedLogs: [],
      saveLog: (original, cleaned) => set((state) => ({
        savedLogs: [{ id: Date.now().toString(), originalUrl: original, cleanedUrl: cleaned, timestamp: Date.now() }, ...state.savedLogs]
      })),
      deleteLog: (id) => set((state) => ({
        savedLogs: state.savedLogs.filter(l => l.id !== id)
      })),
      clearLogs: () => set({ savedLogs: [] }),

      threatConfigs: DEFAULT_THREAT_CONFIGS,
      updateThreatConfig: (id, updates) => set((state) => ({
        threatConfigs: state.threatConfigs.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      securityAlerts: [],
      addSecurityAlert: (alert) => set((state) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
        // Avoid adding identical active alerts for the same URL and threat
        const exists = state.securityAlerts.some(a => a.url === alert.url && a.threatId === alert.threatId && !a.dismissed);
        if (exists) return {};
        return {
          securityAlerts: [
            { ...alert, id, timestamp: Date.now(), dismissed: false },
            ...state.securityAlerts
          ]
        };
      }),
      dismissSecurityAlert: (id) => set((state) => ({
        securityAlerts: state.securityAlerts.map(a => a.id === id ? { ...a, dismissed: true } : a)
      })),
      clearSecurityAlerts: () => set({ securityAlerts: [] }),

      aiConfig: {
        provider: 'openai',
        apiKey: '',
        apiEndpoint: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        enabled: false
      },
      updateAiConfig: (updates) => set((state) => ({
        aiConfig: { ...state.aiConfig, ...updates }
      })),

      resetToDefaults: () => set({
        rules: DEFAULT_RULES,
        threatConfigs: DEFAULT_THREAT_CONFIGS,
        securityAlerts: [],
        savedLogs: []
      })
    }),
    {
      name: 'urlguard-storage',
      partialize: (state) => ({
        rules: state.rules,
        savedLogs: state.savedLogs,
        threatConfigs: state.threatConfigs,
        securityAlerts: state.securityAlerts,
        aiConfig: state.aiConfig
      }),
    }
  )
);
