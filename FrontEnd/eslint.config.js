import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist', 'build', '.react-router']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    rules: {
      // ⚠️ Cảnh báo khi file export cả component lẫn function/biến thường
      'react-refresh/only-export-components': 'warn',

      // ⚠️ Cảnh báo khi destructuring rỗng: const {} = obj
      'no-empty-pattern': 'warn',

      // ⚠️ Cảnh báo khi tạo biến/hàm nhưng không dùng
      '@typescript-eslint/no-unused-vars': 'warn',

      // ⚠️ Cảnh báo khi dùng kiểu `any` thay vì định nghĩa type rõ ràng
      '@typescript-eslint/no-explicit-any': 'warn',

      // ❌ Báo lỗi nếu gọi hook sai chỗ (trong if, vòng lặp...)
      'react-hooks/rules-of-hooks': 'error',

      // ⚠️ Cảnh báo nếu useEffect thiếu dependency
      'react-hooks/exhaustive-deps': 'warn',

      // ⚠️ Cảnh báo khi để console.log trong code
      'no-console': 'warn',

      // ⚠️ Cảnh báo khi để debugger trong code
      'no-debugger': 'warn',

      // ⚠️ Cảnh báo nếu dùng let nhưng giá trị không thay đổi (nên dùng const)
      'prefer-const': 'warn',

      // ⚠️ Cảnh báo khi import cùng 1 file 2 lần
      'no-duplicate-imports': 'warn'
    }
  }
])
