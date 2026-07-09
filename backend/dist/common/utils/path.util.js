"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePath = parsePath;
exports.getValueByPath = getValueByPath;
exports.setValueByPath = setValueByPath;
const PATH_TOKEN_REGEX = /([^[.\]]+)|\[(\d+)\]/g;
function parsePath(path) {
    if (!path) {
        return [];
    }
    return Array.from(path.matchAll(PATH_TOKEN_REGEX)).map((match) => {
        if (match[2] !== undefined) {
            return Number(match[2]);
        }
        return match[1];
    });
}
function getValueByPath(source, path) {
    if (!path) {
        return source;
    }
    return parsePath(path).reduce((current, token) => {
        if (current === null || current === undefined) {
            return undefined;
        }
        return current[token];
    }, source);
}
function setValueByPath(target, path, value) {
    const tokens = parsePath(path);
    if (tokens.length === 0) {
        return;
    }
    let current = target;
    tokens.forEach((token, index) => {
        const isLastToken = index === tokens.length - 1;
        const nextToken = tokens[index + 1];
        if (isLastToken) {
            current[token] = value;
            return;
        }
        if (current[token] === undefined) {
            current[token] = typeof nextToken === 'number' ? [] : {};
        }
        current = current[token];
    });
}
//# sourceMappingURL=path.util.js.map