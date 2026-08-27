# Store Locator Integration Guide

## What this app provides

- `get-stores` for geolocation-driven nearby store search
- `check-stock` for per-store availability lookups
- `sync-store-locations` for PIM-driven master data sync
- `invalidate-stock-cache` for stock cache invalidation on Commerce events
- React components for a Spectrum-based Store Locator SPA
- Preferred-store persistence through session storage with cookie fallback

## Required configuration

Set the following environment variables in App Builder:

- `COMMERCE_GRAPHQL_ENDPOINT`
- `MAPS_API_KEY`
- `IO_STATE_KEY`
- `PIM_API_ENDPOINT`
- `PIM_API_KEY`

## Embed snippet

```html
<div id="store-locator-root"></div>
<script type="module">
  import StoreLocator from 'https://your-app.example.com/store-locator.js';

  const root = document.getElementById('store-locator-root');
  root.render?.(StoreLocator, {
    getStoresUrl: 'https://your-app.example.com/api/get-stores',
    checkStockUrl: 'https://your-app.example.com/api/check-stock'
  });
</script>
```

## ACCS Page Builder HTML block

1. Add an HTML block.
2. Paste the embed snippet.
3. Ensure the page can load Google Maps assets and your App Builder action URLs.
4. Expose `MAPS_API_KEY` only where the browser runtime needs geocoding or map rendering.

## Edge Delivery Services

1. Add a plain container element for the widget.
2. Load the bundle from your App Builder deployment URL.
3. Pass the action endpoints as configuration.
4. Reuse the preferred-store context to notify other storefront UI when the selection changes.

## Headless React storefront

1. Install or import the Locator SPA package from the App Builder build output.
2. Wrap store-aware pages in `PreferredStoreProvider`.
3. Call `get-stores` when the shopper searches by ZIP, city, or coordinates.
4. Call `check-stock` for the selected store and render the stock status beside the store card.

## Notes

- The locator uses Google Maps direction deep links of the form `https://www.google.com/maps/dir/?api=1&destination=...`.
- Store data is read from I/O State, so your sync job should keep the `stores` collection current.
- The cache invalidator is subscribed to `observer.cataloginventory_stock_item_save_commit_after`.
