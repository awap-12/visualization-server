const { colors } = require("./style.js");

const rawSqlKeyWords = ["ADD", "ADD CONSTRAINT", "ALTER", "ALTER COLUMN", "ALTER TABLE", "ALL", "AND", "ANY", "AS",
    "ASC", "BACKUP DATABASE", "BETWEEN", "CASE", "CHECK", "COLUMN", "CONSTRAINT", "CREATE", "CREATE DATABASE",
    "CREATE INDEX", "CREATE OR REPLACE VIEW", "CREATE TABLE", "CREATE PROCEDURE", "CREATE UNIQUE INDEX", "CREATE VIEW",
    "DATABASE", "DEFAULT", "DELETE", "DESC", "DISTINCT", "DROP", "DROP COLUMN", "DROP CONSTRAINT", "DROP DATABASE",
    "DROP DEFAULT", "DROP INDEX", "DROP TABLE", "DROP VIEW", "EXEC", "EXISTS", "FOREIGN KEY", "FROM", "FULL OUTER JOIN",
    "GROUP BY", "HAVING", "IN", "INDEX", "INNER JOIN", "INSERT INTO", "INSERT INTO SELECT", "IS NULL", "IS NOT NULL",
    "JOIN", "LEFT JOIN", "LIKE", "LIMIT", "NOT", "NOT NULL", "OR", "ORDER BY", "OUTER JOIN", "PRIMARY KEY", "PROCEDURE",
    "RIGHT JOIN", "ROWNUM", "SELECT", "SELECT DISTINCT", "SELECT INTO", "SELECT TOP", "SET", "TABLE", "TOP",
    "TRUNCATE TABLE", "UNION", "UNION ALL", "UNIQUE", "UPDATE", "VALUES", "VIEW", "WHERE", "PRAGMA", "INTEGER",
    "PRIMARY", "letCHAR", "DATETIME", "NULL", "REFERENCES", "INDEX_LIST", "BY", "CURRENT_DATE", "CURRENT_TIME", "EACH",
    "ELSE", "ELSEIF", "FALSE", "FOR", "GROUP", "IF", "INSERT", "INTERVAL", "INTO", "IS", "KEY", "KEYS", "LEFT", "MATCH",
    "ON", "OPTION", "ORDER", "OUT", "OUTER", "REPLACE", "TINYINT", "RIGHT", "THEN", "TO", "TRUE", "WHEN", "WITH",
    "UNSIGNED", "CASCADE", "ENGINE", "TEXT", "AUTO_INCREMENT", "SHOW", "BEGIN", "END", "PRINT", "OVERLAPS"];

const rules = [
    {
        name: "keyword",
        group: 1,
        regex: new RegExp(`(^|[^a-zA-Z_])(${[...rawSqlKeyWords, ...rawSqlKeyWords.map(keyword => keyword.toLowerCase())].join('|')})(?=[^a-zA-Z_]|$)`, "g"),
        style: code => colors.magenta(code, "[0m")
    }, {
        name: "special",
        regex: /(=|!=|%|\/|\*|-|,|;|:|\+|<|>)/g,
        style: code => colors.yellow(code, "[0m")
    }, {
        name: "function",
        regex: /(\w+?)\(/g,
        trimEnd: 1,
        style: code => colors.red(code, "[0m")
    }, {
        name: "number",
        regex: /((?<![a-zA-z])\d+(?:\.\d+)?)/g,
        style: code => colors.green(code, "[0m")
    }, {
        name: "string",
        regex: /(["'`].*?["'`])/g,
        style: code => colors.green(code, "[0m")
    }, {
        name: "bracket",
        regex: /([()])/g,
        style: code => colors.yellow(code, "[0m")
    }
];

module.exports = sql => {
    const matches = [];

    for (const rule of rules) {
        let match;
        while (match = rule.regex.exec(sql)) {
            let text = match[0], boringLength = 0;

            // If a specific group is requested, use that group instead, and make sure we offset the index by the length of the preceding groups
            if (rule.group) {
                text = match[rule.group + 1]
                for (let i = 1; i <= rule.group; i++) {
                    boringLength += match[i].length;
                }
            }

            matches.push({
                name: rule.name,
                start: match.index + boringLength,
                length: (rule.trimEnd ? text.slice(0, -rule.trimEnd) : text).length,
                style: rule.style
            });
        }
    }

    const sortedMatches = matches.slice().sort((a, b) => a.start - b.start)

    // filter/exclude nested matches (matches within the last match)
    const filteredMatches = [];
    let upperBound = 0, highlighted = '';
    for (let i = 0; i < sortedMatches.length; i++) {
        if (sortedMatches[i].start >= upperBound) {
            filteredMatches.push(sortedMatches[i]);
            upperBound = sortedMatches[i].start + sortedMatches[i].length;
        }
    }

    for (let i = 0; i < filteredMatches.length; i++) {
        const match = filteredMatches[i], nextMatch = filteredMatches[i + 1];
        const stringMatch = sql.substring(match.start, match.start + match.length);

        highlighted += match.style(stringMatch);

        if (!!nextMatch) {
            highlighted += sql.substring(match.start + match.length, nextMatch.start)
        } else if (sql.length > (match.start + match.length)) {
            highlighted += sql.substring(match.start + match.length)
        }
    }

    return highlighted;
};
