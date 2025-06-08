# Real-Time Exchange Rate Implementation Guide

This document outlines how real-time exchange rates are implemented in this application.

## Architecture Overview

1. **API Layer**: We use the ExchangeRate-API service with a REST endpoint to fetch current rates.
2. **Server API Route**: We created a Next.js API route that acts as a proxy to the external API service.
3. **Client Components**: Two React components handle displaying and updating the rates:
   - `CurrencyConverter`: For currency conversion with real-time rates
   - `LiveExchangeRate`: A reusable component to display live exchange rates

## Real-Time Update Mechanism

The real-time updates are achieved through:

1. **Initial Load**: Rates are fetched when components mount
2. **Polling Mechanism**: Regular interval polling (every 60 seconds by default)
3. **Manual Refresh**: User can trigger manual updates
4. **Cleanup**: Proper interval cleanup on component unmount

## API Endpoint

The API route (`/api/currency/route.ts`) handles:
- Making requests to ExchangeRate-API
- Error handling and appropriate responses
- Passing through query parameters for the base currency

## Component Configuration

The `LiveExchangeRate` component accepts these props:
- `baseCurrency`: The base currency to get rates for (default: USD)
- `displayCurrencies`: Array of currency codes to display
- `refreshInterval`: Polling frequency in milliseconds (default: 60000)

## Usage Example

```jsx
// Basic usage
<LiveExchangeRate />

// Customized
<LiveExchangeRate 
  baseCurrency="EUR"
  displayCurrencies={['USD', 'GBP', 'JPY']}
  refreshInterval={30000}
/>
```

## Setup Requirements

1. Get an API key from [ExchangeRate-API](https://www.exchangerate-api.com/)
2. Add the key to `.env.local`: `EXCHANGE_RATE_API_KEY=your-key-here`
3. Make sure the API endpoints are working correctly

## Performance Considerations

- The polling interval is set to 60 seconds to avoid excessive API calls
- Error states are handled gracefully with fallbacks
- Loading states provide visual feedback during updates

## Future Improvements

- Implement WebSocket for true real-time updates instead of polling
- Add historical rate charts
- Cache responses on the server to reduce API calls
- Add more currencies and custom user presets
