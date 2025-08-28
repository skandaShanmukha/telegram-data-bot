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

## [Initial Release] - 2023-11-05
### Added
- Telegram bot with /add, /ask, /search commands
- Basic NLP categorization engine
- SQLite database integration
- OOP architecture with command pattern
- GitHub repository setup
