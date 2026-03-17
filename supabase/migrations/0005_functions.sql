CREATE OR REPLACE FUNCTION set_daily_report_locked_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.locked = true AND OLD.locked = false THEN
        NEW."lockedAt" = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_daily_report_locked_at
BEFORE UPDATE ON "dailyReport"
FOR EACH ROW
EXECUTE FUNCTION set_daily_report_locked_at();
