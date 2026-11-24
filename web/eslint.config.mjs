import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Supabaseへの問い合わせは external/repositories 配下に閉じ込め、
  // ページ/コンポーネントから直接呼び出すのを禁止する。
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["external/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/client",
              message:
                "Supabaseへの問い合わせは external/repositories 配下に作成し、そちらを呼び出してください。",
            },
            {
              name: "@/lib/supabase/server",
              message:
                "Supabaseへの問い合わせは external/repositories 配下に作成し、そちらを呼び出してください。",
            },
          ],
          patterns: [
            {
              group: ["**/lib/supabase/client", "**/lib/supabase/server"],
              message:
                "Supabaseへの問い合わせは external/repositories 配下に作成し、そちらを呼び出してください。",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
