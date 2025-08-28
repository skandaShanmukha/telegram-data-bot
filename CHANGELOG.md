# Changelog

## [Unreleased]
### Added
- Custom JSON file database implementation (replacing SQLite/LowDB)
- Robust file handling with atomic writes and error recovery
- Automatic directory creation and file initialization
- Better error handling for file operations

### Changed
- Removed SQLite and LowDB dependencies
- Simplified package.json to only essential dependencies
- Improved memory usage and performance
- Enhanced Termux compatibility

### Fixed
- Termux compatibility issues with database libraries
- Memory leaks in previous implementations
- File corruption handling and recovery

## [Initial Release] - 2025-08-28

### Added
- Telegram bot with /add, /ask, /search commands
- Basic NLP categorization engine
- SQLite database integration
- OOP architecture with command pattern
- GitHub repository setup

## [Fixed] - 2025-08-28
### Fixed
- Duplicate URL detection now works correctly
- Semantic search properly finds "programming" when searching "coding"
- Category management issues resolved
- Enhanced URL normalization for better duplicate detection
- Improved error handling and user suggestions

### Changed
- Better semantic mapping with reverse lookup
- Search algorithm with multiple fallback strategies
- Preserve original category when updating duplicates

## [Feature] - 2025-08-28

### Added
- Telegram bot with /job, /jobs
- /job sets jobs in DB
- /jobs lists all active jobs currently active
