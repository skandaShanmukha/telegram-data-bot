# Telegram Data Bot 🤖

A lightweight, zero-cost Telegram bot for collecting, categorizing, and sharing valuable resources. Built with Node.js and SQLite, optimized for low-spec devices and Termux on Android.

## 🌟 Vision

Create a simple, free solution for community knowledge sharing through Telegram with:
- Automatic smart categorization
- Easy resource retrieval
- Group collaboration features
- Zero ongoing costs
- 24/7 availability on personal devices

## 🚀 Features

### Current Features
- `/add [category] [url] [description]` - Add resources with auto-categorization
- `/ask [category]` - Retrieve resources by category
- `/search [keyword]` - Search across all resources
- SQLite database for persistence
- Basic NLP categorization using keyword matching

### Planned Features
- `/help` - Comprehensive help guide
- `/info` - Developer information
- `/delete [token] [url]` - Secure resource deletion
- User activity logging
- Job posting section
- People/network directory  
- Reminder system (`/remind`)
- Duplicate detection and updates

## 🏗️ Architecture
```
src/
├── core/ # Core application setup
│ ├── Bot.js # Main bot initialization
│ └── Config.js # Configuration management
├── services/ # Business logic layer
│ ├── ResourceService.js # Database operations
│ └── CategorizationEngine.js # NLP categorization
├── commands/ # Telegram command handlers
│ ├── AddCommand.js # /add command
│ ├── AskCommand.js # /ask command
│ └── SearchCommand.js # /search command
├── data-structures/ # Custom data structures
│ ├── Trie.js # Prefix tree for search
│ └── LRUCache.js # Cache implementation
└── main.js # Application entry point
```

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **SQLite** - Lightweight database
- **node-telegram-bot-api** - Telegram Bot API wrapper
- **Termux** - Android terminal environment for hosting

## 📦 Installation

1. **Termux Setup:**
```bash
pkg update && pkg install nodejs sqlite -y
```

2. **Clone & Install:**
```bash

git clone <your-repo-url>
cd telegram-data-bot
npm install

```
3. **Configure Bot:**
```bash
cp .env.example .env
# Edit .env with your Telegram bot token from @BotFather
```
4. **Run Bot:**
```bash
node src/main.js
```

---

## Configuration
Create `.env` file.
```bash
TELEGRAM_TOKEN=your_bot_token_here
```

## Deployement on Termux:
For 24/7 operation:
```bash
# Install process manager
npm install -g pm2

# Start bot
pm2 start src/main.js --name telegram-bot

# Save process list
pm2 save

# Generate startup script
pm2 startup
```

## DataBase Schema
```sql
CREATE TABLE resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Example
```bash
# Add a resource (auto-categorization)
/add https://freecodecamp.org Free programming resources

# Add with specific category  
/add security https://overthewire.org Wargames for security practice

# Retrieve resources
/ask programming

# Search across all resources
/search javascript
```

## Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing-feature)

Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
🐛 Troubleshooting

## Common Issues:

Bot not responding: Check Telegram token in .env

Database errors: Ensure SQLite is installed in Termux

Process killed: Use PM2 for process management

## 🙏 Acknowledgments

Telegram Bot API for seamless integration

SQLite for lightweight database solution

Termux for Android development environment

---

**Note**: This is a personal project optimized for zero budget and low-resource environments. Not intended for commercial use.


## .gitignore file

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

```

