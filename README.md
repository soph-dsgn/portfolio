# Портфолио Софьи Стрельченко

Личное портфолио UX/UI & Product Designer на React, TypeScript и Vite.

## Разработка

```sh
npm ci
npm run dev
```

Проверки: `npm run lint` и `npm run build`.

## GitHub Pages

В настройках репозитория **Settings → Pages → Build and deployment → Source** выберите **GitHub Actions**. Публикация запускается при отправке изменений в ветку `master` или вручную из Actions. Сайт собирается для адреса `https://soph-dsgn.github.io/portfolio/`.

Workflow собирает Vite-приложение в job `build` и передаёт только `dist` в job `deploy`. Исходники и документация не публикуются; Jekyll не используется. Production/preview base — `/portfolio/`. Пустой файл `public/.nojekyll` копируется Vite в `dist/.nojekyll`, а `dist/404.html` обеспечивает SPA fallback.

Шрифты из `public/fonts` проходят через Vite CSS URL rewriting и `%BASE_URL%` в preload: dev использует `/fonts/`, production — `/portfolio/fonts/`. CV и HH временно неактивны до добавления реальных URL в `profile`.
