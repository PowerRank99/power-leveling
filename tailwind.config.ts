
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// PowerLeveling Brand Colors
				midnight: {
					DEFAULT: '#0D0D2B', // Midnight Void
					50: '#1A1A47',
					100: '#232362',
					200: '#2C2C7D',
					300: '#353598',
					400: '#3F3FB4',
					500: '#4848CF',
					600: '#6262D7',
					700: '#7C7CE0',
					800: '#9696E8',
					900: '#B0B0F0'
				},
				arcane: {
					DEFAULT: '#7C3AED', // Arcane Purple
					50: '#EFE6FC',
					100: '#E1CEF9',
					200: '#C69FF3',
					300: '#AA6FED',
					400: '#8F40E6',
					500: '#7C3AED',
					600: '#6021D0',
					700: '#4C1AA1',
					800: '#381273',
					900: '#240B44'
				},
				valor: {
					DEFAULT: '#EF4444', // Valor Crimson
					50: '#FDEDED',
					100: '#FADADA',
					200: '#F6B6B6',
					300: '#F39191',
					400: '#F16D6D',
					500: '#EF4444',
					600: '#E71414',
					700: '#B30F0F',
					800: '#800B0B',
					900: '#4C0707'
				},
				xpgold: {
					DEFAULT: '#FACC15', // XP Gold
					50: '#FFFBE8',
					100: '#FEF7D0',
					200: '#FDEFA1',
					300: '#FCE772',
					400: '#FBDE44',
					500: '#FACC15',
					600: '#D6AB02',
					700: '#A38301',
					800: '#715C01',
					900: '#3E3300'
				},
				energy: {
					DEFAULT: '#06B6D4', // Energy Cyan
					50: '#E0F7FC',
					100: '#C2EFF9',
					200: '#86E0F3',
					300: '#49D0ED',
					400: '#1CBBE2',
					500: '#06B6D4',
					600: '#0592AA',
					700: '#046E80',
					800: '#034A55',
					900: '#01272B'
				},
				rest: {
					DEFAULT: '#22C55E', // Rest Green
					50: '#E9F9EF',
					100: '#D3F4DF',
					200: '#A8E9C0',
					300: '#7DDDA0',
					400: '#52D280',
					500: '#22C55E',
					600: '#1B9C4A',
					700: '#147437',
					800: '#0D4B24',
					900: '#072310'
				},
				steel: {
					DEFAULT: '#9CA3AF', // Steel Gray
					50: '#F9FAFB',
					100: '#F3F4F6',
					200: '#E5E7EB',
					300: '#D1D5DB',
					400: '#9CA3AF',
					500: '#6B7280',
					600: '#4B5563',
					700: '#374151',
					800: '#1F2937',
					900: '#111827'
				},
				ghost: {
					DEFAULT: '#F8FAFC', // Ghost White
					50: '#FFFFFF',
					100: '#F8FAFC',
					200: '#E0E7F4',
					300: '#C7D5EC',
					400: '#AFC2E3',
					500: '#96B0DB',
					600: '#6990CC',
					700: '#406FB9',
					800: '#2F528A',
					900: '#1F365B'
				},
				fitblue: {
					DEFAULT: '#2563eb',
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a'
				},
				fitgreen: {
					DEFAULT: '#10b981',
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b'
				},
				fitpurple: {
					DEFAULT: '#8b5cf6',
					50: '#f5f3ff',
					100: '#ede9fe',
					200: '#ddd6fe',
					300: '#c4b5fd',
					400: '#a78bfa',
					500: '#8b5cf6',
					600: '#7c3aed',
					700: '#6d28d9',
					800: '#5b21b6',
					900: '#4c1d95'
				}
			},
			fontFamily: {
				display: ['Unica One', 'system-ui', 'sans-serif'],  // Display font for headers
				body: ['Inter', 'system-ui', 'sans-serif'],         // Body text
				mono: ['Share Tech Mono', 'monospace']              // XP/Stats text
			},
			boxShadow: {
				glow: '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)',
				'glow-gold': '0 0 10px rgba(250, 204, 21, 0.5), 0 0 20px rgba(250, 204, 21, 0.3)',
				'glow-cyan': '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
				'glow-crimson': '0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				'scale-in': {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
				'pulse-glow': {
					'0%, 100%': { 
						opacity: '1',
						boxShadow: '0 0 15px rgba(124, 58, 237, 0.7)' 
					},
					'50%': { 
						opacity: '0.7',
						boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)' 
					},
				},
				'shimmer': {
					'0%': { 
						backgroundPosition: '-500px 0' 
					},
					'100%': { 
						backgroundPosition: '500px 0' 
					},
				},
				'level-up-flash': {
					'0%': { 
						opacity: '0',
						transform: 'scale(0.8)',
					},
					'10%': { 
						opacity: '1',
						transform: 'scale(1.1)',
					},
					'20%': { 
						transform: 'scale(1)',
					},
					'80%': { 
						opacity: '1',
					},
					'100%': { 
						opacity: '0',
					},
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)',
					},
					'50%': {
						transform: 'translateY(-10px)',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'level-up-flash': 'level-up-flash 2s ease-out forwards',
				'float': 'float 3s ease-in-out infinite',
			},
			backgroundImage: {
				'gradient-arcane-valor': 'linear-gradient(135deg, #7C3AED 0%, #EF4444 100%)',
				'gradient-arcane-energy': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
				'gradient-valor-xpgold': 'linear-gradient(135deg, #EF4444 0%, #FACC15 100%)',
				'gradient-midnight-arcane-xpgold': 'linear-gradient(135deg, #0D0D2B 0%, #7C3AED 50%, #FACC15 100%)',
				'gradient-radial-arcane': 'radial-gradient(circle, #7C3AED 0%, transparent 70%)',
				'shimmer-gold': 'linear-gradient(90deg, rgba(250,204,21,0) 0%, rgba(250,204,21,0.8) 50%, rgba(250,204,21,0) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
