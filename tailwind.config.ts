
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
			fontFamily: {
				orbitron: ['Orbitron', 'sans-serif'],
				sora: ['Sora', 'sans-serif'],
				space: ['Space Grotesk', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Midnight theme colors
				midnight: {
					deep: '#050510',
					base: '#07071A',
					card: '#0D0D2B',
					elevated: '#12123A',
				},
				// Accent colors
				arcane: {
					DEFAULT: 'rgba(124, 58, 237, 0.9)',
					60: 'rgba(124, 58, 237, 0.6)',
					30: 'rgba(124, 58, 237, 0.3)',
					15: 'rgba(124, 58, 237, 0.15)',
				},
				valor: {
					DEFAULT: 'rgba(239, 68, 68, 0.9)',
					60: 'rgba(239, 68, 68, 0.6)',
					30: 'rgba(239, 68, 68, 0.3)',
					15: 'rgba(239, 68, 68, 0.15)',
				},
				achievement: {
					DEFAULT: 'rgba(250, 204, 21, 0.85)',
					60: 'rgba(250, 204, 21, 0.6)',
					30: 'rgba(250, 204, 21, 0.3)',
					15: 'rgba(250, 204, 21, 0.15)',
				},
				// Text colors
				text: {
					primary: 'rgba(255, 255, 255, 0.95)',
					secondary: 'rgba(255, 255, 255, 0.75)',
					tertiary: 'rgba(255, 255, 255, 0.5)',
				},
				divider: 'rgba(255, 255, 255, 0.07)',
				overlay: 'rgba(0, 0, 0, 0.3)',
				inactive: 'rgba(255, 255, 255, 0.4)',
				// Original colors
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'subtle': '0 4px 10px rgba(0, 0, 0, 0.2)',
				'elevated': '0 6px 16px rgba(0, 0, 0, 0.35)',
				'glow-purple': '0 0 15px rgba(124, 58, 237, 0.4)',
				'glow-gold': '0 0 15px rgba(250, 204, 21, 0.4)',
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
				'pulse-glow': {
					"0%, 100%": {
						boxShadow: "0 0 10px rgba(124, 58, 237, 0.2)"
					},
					"50%": {
						boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)"
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
