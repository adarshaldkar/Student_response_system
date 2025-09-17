/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./src/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  // Safelist ALL responsive classes to prevent purging in production
  safelist: [
    // Responsive prefix patterns - simplified to work correctly
    'sm:text-base', 'sm:text-sm', 'sm:text-xs', 'sm:px-4', 'sm:py-2', 'sm:px-6', 'sm:space-y-2',
    'sm:mb-8', 'sm:py-6', 'sm:h-11', 'sm:block', 'sm:hidden', 'sm:flex', 'sm:grid', 'sm:px-2',
    'md:hidden', 'md:block', 'md:flex', 'md:grid', 'md:text-base', 'md:px-4', 'md:py-2',
    'lg:hidden', 'lg:block', 'lg:grid-cols-2', 'lg:text-base', 'lg:py-8', 'lg:px-6', 'lg:flex',
    'lg:grid-cols-4', 'xl:px-8', 'xl:block', 'xl:flex', 'xl:hidden',
    // Layout and spacing
    'overflow-x-hidden', 'max-w-full', 'w-full', 'min-h-screen', 'container-responsive',
    'table-responsive', 'border-collapse', 'min-w-[1000px]', 'max-w-[1400px]',
    'grid-cols-1', 'grid-cols-2', 'space-y-4', 'space-y-3', 'space-y-2',
    // Buttons and forms
    'h-10', 'h-11', 'w-16', 'h-8', 'justify-start', 'justify-between', 'items-center',
    'flex-1', 'min-w-0', 'gap-2', 'gap-3', 'gap-4',
    // Navigation specific
    'sticky', 'top-0', 'z-50', 'shrink-0', 'truncate',
    // Card and content
    'rounded', 'rounded-lg', 'shadow', 'shadow-lg', 'border', 'bg-white', 'bg-gray-50',
    // Typography
    'font-bold', 'font-medium', 'text-gray-900', 'text-gray-600', 'text-blue-600',
    // Responsive spacing
    'sm:space-x-2', 'sm:space-x-3', 'sm:space-x-4', 'sm:gap-2', 'sm:gap-3', 'sm:gap-4',
    'md:space-x-2', 'md:space-x-3', 'md:space-x-4', 'md:gap-2', 'md:gap-3', 'md:gap-4',
    'lg:space-x-2', 'lg:space-x-3', 'lg:space-x-4', 'lg:gap-2', 'lg:gap-3', 'lg:gap-4',
    'xl:space-x-2', 'xl:space-x-3', 'xl:space-x-4', 'xl:gap-2', 'xl:gap-3', 'xl:gap-4',
    // Flex responsive
    'flex-col', 'flex-row', 'sm:flex-row', 'lg:flex-row',
    // Critical tab classes
    'grid', 'h-auto', 'whitespace-nowrap'
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};