module.exports = [
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "*.config.*js",
        ],
    },

    require("@eslint/js").configs.recommended,
    ...require("typescript-eslint").configs.recommended,
];