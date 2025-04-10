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
				// RPG theme colors
				midnight: {
					DEFAULT: '#0D0D2B',
					dark: '#070720',
					light: '#151540',
				},
				arcane: {
					DEFAULT: '#7C3AED',
					light: '#9D6FF3',
					dark: '#5B21B6',
				},
				valor: {
					DEFAULT: '#EF4444',
					light: '#F87171',
					dark: '#B91C1C',
				},
				xpgold: {
					DEFAULT: '#FACC15',
					light: '#FDE68A',
					dark: '#D97706',
				},
				energy: {
					DEFAULT: '#06B6D4',
					light: '#67E8F9',
					dark: '#0891B2',
				},
				restgreen: {
					DEFAULT: '#22C55E',
					light: '#86EFAC',
					dark: '#15803D',
				},
				steel: {
					DEFAULT: '#9CA3AF',
					light: '#D1D5DB',
					dark: '#6B7280',
				},
				ghostwhite: {
					DEFAULT: '#F8FAFC',
					dark: '#E2E8F0',
				},
				// App-specific colors from existing theme
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
                orbitron: ['Orbitron', 'sans-serif'],
                sora: ['Sora', 'sans-serif'],
                'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
                // Keeping existing fonts for compatibility
                cinzel: ['Cinzel', 'serif'],
                inter: ['Inter', 'sans-serif'],
                'ibm-plex': ['"IBM Plex Mono"', 'monospace'],
            },
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
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
				'glow-pulse': {
					"0%, 100%": { 
						opacity: "0.8",
						filter: "drop-shadow(0 0 4px currentColor)"
					},
					"50%": { 
						opacity: "1",
						filter: "drop-shadow(0 0 8px currentColor)"
					}
				},
				'shimmer': {
					"0%": { 
						backgroundPosition: "-200% 0"
					},
					"100%": { 
						backgroundPosition: "200% 0"
					}
				},
				'float': {
					"0%, 100%": { 
						transform: "translateY(0)"
					},
					"50%": { 
						transform: "translateY(-5px)"
					}
				},
				'magic-particles': {
					"0%": {
						transform: "translateY(0) scale(1)",
						opacity: "0"
					},
					"50%": {
						opacity: "1"
					},
					"100%": {
						transform: "translateY(-20px) scale(0)",
						opacity: "0"
					}
				},
				'glow-border': {
					"0%, 100%": {
						boxShadow: "0 0 5px 2px rgba(124, 58, 237, 0.5)"
					},
					"50%": {
						boxShadow: "0 0 10px 3px rgba(124, 58, 237, 0.8)"
					}
				},
				'level-up-flash': {
					"0%": {
						opacity: "0",
						transform: "scale(0.8)"
					},
					"60%": {
						opacity: "1",
						transform: "scale(1.1)"
					},
					"100%": {
						opacity: "0",
						transform: "scale(1.2)"
					}
				},
				'trophy-bounce': {
					"0%, 100%": {
						transform: "translateY(0)"
					},
					"50%": {
						transform: "translateY(-15px)"
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'magic-particles': 'magic-particles 1.5s ease-out',
				'glow-border': 'glow-border 2s ease-in-out infinite',
				'level-up-flash': 'level-up-flash 2s ease-out',
				'trophy-bounce': 'trophy-bounce 1s ease-in-out',
			},
			backgroundSize: {
				'200%': '200% 100%',
			},
			backgroundImage: {
				'hero-pattern': 'url("/images/hero-pattern.svg")',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'arcane-valor': 'linear-gradient(135deg, #7C3AED 0%, #EF4444 100%)',
				'arcane-energy': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
				'valor-xpgold': 'linear-gradient(135deg, #EF4444 0%, #FACC15 100%)',
				'midnight-arcane-xpgold': 'linear-gradient(135deg, #0D0D2B 0%, #7C3AED 50%, #FACC15 100%)',
				'dark-card': 'linear-gradient(180deg, rgba(13,13,43,0.8) 0%, rgba(13,13,43,0.95) 100%)',
				'stats-glow': 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0) 70%)',
			},
			boxShadow: {
				'glow-sm': '0 0 5px rgba(124, 58, 237, 0.5)',
				'glow-md': '0 0 10px rgba(124, 58, 237, 0.5)',
				'glow-lg': '0 0 15px rgba(124, 58, 237, 0.5)',
				'glow-xl': '0 0 20px rgba(124, 58, 237, 0.5)',
				'glow-valor': '0 0 10px rgba(239, 68, 68, 0.5)',
				'glow-xpgold': '0 0 10px rgba(250, 204, 21, 0.5)',
				'glow-energy': '0 0 10px rgba(6, 182, 212, 0.5)',
				'inner-glow': 'inset 0 0 10px rgba(124, 58, 237, 0.3)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
