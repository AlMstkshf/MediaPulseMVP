# Media Pulse Dashboard Deployment Notes

## Port Configuration

The Media Pulse Dashboard has been configured to work on port 5000 to match Replit's expected port configuration. This is reflected in:

1. `server/config.ts` - Default port set to 5000
2. `replit-fix.sh` - Sets environment PORT to 5000
3. `.replit` - Port configuration maps localPort 5000 to externalPort 80

## CORS Configuration

Enhanced CORS configuration has been added to handle Replit's specific requirements:

1. Custom CORS middleware in `server/cors-fix.ts`
2. Updated CORS settings in `server/index.ts`
3. Allow all origins in development mode

## Deployment Process

When deploying to Replit:

1. Run the `replit-fix.sh` script to set up the proper file structure
2. Ensure the server is configured to serve static files from the correct location
3. Restart the application workflow

## Troubleshooting

If the application isn't accessible:

1. Verify the server is running on port 5000
2. Check for CORS errors in the browser console
3. Ensure client assets are properly being served
4. Look for connection timeouts or database errors in the logs

## Next Steps

To complete deployment:

1. Verify that requests to any route are handled correctly
2. Ensure static assets like images and stylesheets are loading
3. Test functionality with a real database connection
4. Enable production mode when ready for final deployment