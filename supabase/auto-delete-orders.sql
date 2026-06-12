-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a daily job at midnight to delete orders older than 7 days with status "delivered"
-- This will cascade to delete related order_items and cancellations
-- Keeps customers and payments tables intact

SELECT cron.schedule(
  'delete_old_delivered_orders',
  '0 0 * * *', -- Run daily at midnight
  $$
  DELETE FROM orders
  WHERE status = 'delivered'
    AND delivered_at < NOW() - INTERVAL '7 days'
  $$
);

-- Verify the job was scheduled
SELECT * FROM cron.job WHERE jobname = 'delete_old_delivered_orders';
