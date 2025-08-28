class CategorizationEngine {
    constructor() {
        this.keywordCategories = new Map();
        this.initializeCategories();
    }

    initializeCategories() {
        const categories = {
            'programming': ['code', 'python', 'javascript', 'java', 'node', 'react', 'vue', 'angular', 'git', 'github', 'algorithm', 'database', 'sql', 'nosql', 'api', 'backend', 'frontend', 'coding', 'developer', 'programming', 'software'],
            'design': ['design', 'ui', 'ux', 'figma', 'photoshop', 'illustrator', 'sketch', 'prototype', 'wireframe', 'typography', 'color', 'layout', 'responsive', 'graphic', 'visual'],
            'business': ['business', 'startup', 'marketing', 'finance', 'investment', 'venture', 'capital', 'entrepreneur', 'strategy', 'growth', 'metrics', 'roi', 'customer', 'sales'],
            'devops': ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci', 'cd', 'pipeline', 'deployment', 'infrastructure', 'monitoring', 'server', 'cloud'],
            'machinelearning': ['ml', 'ai', 'neural', 'network', 'tensorflow', 'pytorch', 'dataset', 'training', 'model', 'prediction', 'nlp', 'computer vision', 'deep learning', 'artificial intelligence'],
            'security': ['security', 'hacking', 'cybersecurity', 'pentest', 'firewall', 'encryption', 'vulnerability', 'malware', 'privacy', 'authentication'],
            'wargames': ['wargame', 'ctf', 'capture the flag', 'hacking challenge', 'security challenge', 'overthewire'],
            'education': ['learn', 'education', 'tutorial', 'course', 'free', 'resource', 'learning', 'study', 'training']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            keywords.forEach(keyword => {
                this.keywordCategories.set(keyword, category);
            });
        }
    }

    categorize(text, userCategory = '') {
        if (userCategory) return userCategory.toLowerCase();

        const tokens = this.tokenize(text);
        const categoryScores = new Map();
        
        for (const token of tokens) {
            for (const [keyword, category] of this.keywordCategories.entries()) {
                if (token.includes(keyword)) {
                    categoryScores.set(category, (categoryScores.get(category) || 0) + 1);
                }
            }
        }

        if (categoryScores.size > 0) {
            return Array.from(categoryScores.entries())
                .sort((a, b) => b[1] - a[1])[0][0];
        }

        return 'general';
    }

    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
}

module.exports = CategorizationEngine;
