SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'jobs' 
      AND COLUMN_NAME = 'status'
);

SET @stmt = IF(@col_exists = 0, 
    'ALTER TABLE jobs ADD COLUMN status VARCHAR(50) DEFAULT ''ACTIVE''', 
    'SELECT 1'
);

PREPARE add_col_stmt FROM @stmt;
EXECUTE add_col_stmt;
DEALLOCATE PREPARE add_col_stmt;

UPDATE jobs SET status = 'ACTIVE' WHERE status IS NULL;

