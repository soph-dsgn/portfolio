import { useLocale } from '../i18n/locale'
import { useEffect } from 'react'
import { profile } from '../data/portfolio'
import { trackEvent } from '../lib/analytics'
import { Typography } from '../components/Typography'
import { Footer } from '../components/Footer'

export function CopyrightPage() {
  const { t } = useLocale()
  useEffect(() => { document.title = `${t('Авторские права')} — ${t(profile.name)}` }, [t])

  return (
    <Typography><div className="copyright-shell">
      <main className="copyright-page" id="main-content" tabIndex={-1}>
        <article className="copyright-document">
        <header className="copyright-intro">
          <h1>Уведомление об авторских правах на материалы портфолио</h1>
        </header>

        <section aria-labelledby="copyright-law">
          <h2 id="copyright-law">1. Правовая основа</h2>
          <p>Настоящее уведомление составлено в соответствии с положениями Части четвертой Гражданского кодекса Российской Федерации (Раздел VII, Глава 70). Авторские права на произведения дизайна, графики и программного кода возникают в силу факта их создания. Регистрация произведений в государственных органах для возникновения и защиты прав не требуется (п. 4 ст. 1259 ГК РФ).</p>
        </section>

        <section aria-labelledby="copyright-works">
          <h2 id="copyright-works">2. Объекты прав</h2>
          <p>Объектами авторских прав на данном ресурсе выступают:</p>
          <ul>
            <li>Произведения дизайна (визуальный UI дизайн веб-сайтов и мобильных приложений);</li>
            <li>Произведения архитектуры сайтов (структура, UX-сценарии, вайрфреймы);</li>
            <li>Графические произведения (иллюстрации, иконки, логотипы);</li>
            <li>Программные произведения (фрагменты фронтенд-кода, если они демонстрируются).</li>
          </ul>
        </section>

        <section aria-labelledby="copyright-status">
          <h2 id="copyright-status">3. Правовой статус работ</h2>
          <p>Если иное прямо не указано в описании конкретного проекта:</p>
          <ul>
            <li>Исключительное право на работы, созданные в рамках коммерческой деятельности, принадлежит Заказчику (на основании ст. 1296 ГК РФ — «Произведения, созданные по заказу»).</li>
            <li>Исключительное право на личные, концептуальные и неопубликованные коммерческие работы принадлежит Автору ({profile.name}).</li>
            <li>Авторство (право называться автором) и право на имя являются неотчуждаемыми и непередаваемыми (ст. 1265 ГК РФ).</li>
          </ul>
        </section>

        <section aria-labelledby="copyright-use">
          <h2 id="copyright-use">4. Правила использования материалов</h2>
          <p>Свободное использование материалов портфолио без согласия Автора и без выплаты вознаграждения допускается только в случаях, прямо предусмотренных ст. 1274 ГК РФ (например, в информационных, научных или учебных целях с обязательным указанием имени автора и источника заимствования).</p>
          <p>Категорически запрещается:</p>
          <ul>
            <li>Присвоение авторства (плагиат);</li>
            <li>Внесение изменений в дизайн-макеты;</li>
            <li>Использование визуальных концепций в коммерческих проектах третьих лиц.</li>
          </ul>
        </section>

        <section aria-labelledby="copyright-protection">
          <h2 id="copyright-protection">5. Защита прав</h2>
          <p>В случае нарушения исключительного права Автор оставляет за собой право требовать компенсацию в размере от десяти тысяч до десяти миллионов рублей (ст. 1301 ГК РФ) или в двукратном размере стоимости права использования произведения.</p>
        </section>

        <footer className="copyright-meta">
          <address className="copyright-contact">
            <strong>Контакт для связи по вопросам прав:</strong> Email: <a href={profile.email} onClick={() => trackEvent('email_click', { location: 'copyright' })}>{profile.email.replace(/^mailto:/, '')}</a>
          </address>
          <p className="copyright-updated">Дата последнего обновления документа: 01.10.2026.</p>
        </footer>
        </article>
      </main>
      <Footer />
    </div></Typography>
  )
}
