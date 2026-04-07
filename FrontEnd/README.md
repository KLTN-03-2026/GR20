// "lint": "eslint --ext ts,tsx src/",

.eslintrc.js
const path = require('path')

module.exports = {
// ✅ Kế thừa các rule mặc định từ ESLint, React, TypeScript và Prettier
extends: [
'eslint:recommended', // Rule cơ bản của ESLint
'plugin:react/recommended', // Rule gợi ý cho React
'plugin:react-hooks/recommended',
'plugin:import/recommended', // Rule kiểm tra import/export
'plugin:jsx-a11y/recommended', // Rule hỗ trợ accessibility (JSX)
'plugin:@typescript-eslint/recommended', // Rule cho TypeScript
'eslint-config-prettier', // Tắt rule ESLint xung đột với Prettier
'prettier' // Kích hoạt rule format từ Prettier
],

// ✅ Khai báo plugin
plugins: ['prettier'],

// ✅ Cài đặt thêm cho ESLint
settings: {
react: {
// Giúp eslint-plugin-react tự nhận phiên bản React
version: 'detect'
},
// Cấu hình cách ESLint xử lý các import
'import/resolver': {
node: {
// Cho phép import ngắn gọn từ thư mục src
paths: [path.resolve(__dirname)],
// Các phần mở rộng được ESLint nhận diện
extensions: ['.js', '.jsx', '.ts', '.tsx']
}
}
},

rules: {
'react/react-in-jsx-scope': 'warn',
'react/jsx-no-target-blank': 'warn',

    // ⚠️ Thêm dòng này để tắt cảnh báo biến chưa dùng
    '@typescript-eslint/no-unused-vars': 'of',

    '@typescript-eslint/no-explicit-any': 'warn',
    'react-refresh/only-export-components': 'warn',
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always',
        semi: false,
        trailingComma: 'none',
        tabWidth: 2,
        endOfLine: 'auto',
        useTabs: false,
        singleQuote: true,
        printWidth: 120,
        jsxSingleQuote: true
      }
    ]

}
}
