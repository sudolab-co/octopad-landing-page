// Shared header + footer rendered via vanilla JS so every page stays in sync.
// Each page sets window.__page (e.g. 'product') before including this.
(function () {
  const page = window.__page || '';
  const nav = [
    { id: 'product', label: 'Product', href: 'index.html' },
    { id: 'pricing', label: 'Pricing', href: 'pricing.html' },
    { id: 'quickstart', label: 'Quick start', href: 'quick-start.html' },
    { id: 'about', label: 'About', href: 'about.html' },
    { id: 'blog', label: 'Blog', href: 'blog.html' },
  ];

  const headerHtml = `
    <header class="site-header">
      <div class="wrap bar">
        <a href="index.html" class="brand">
          <img src="assets/mascot.png" alt="" />
          <span>Octopad</span>
        </a>
        <nav class="nav" aria-label="Primary">
          ${nav.map(n => `<a href="${n.href}"${n.id === page ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
        </nav>
        <div class="actions">
          <a href="#" class="signin">Sign in</a>
          <a href="#" class="btn btn-primary">Get started</a>
        </div>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="brand"><img src="assets/mascot.png" alt=""/><span>Octopad</span></a>
            <p class="small" style="max-width: 32ch; margin-top: 14px;">
              The back-office for AI teams. One shared brain across Claude, ChatGPT, Cursor and the rest.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><a href="index.html">Overview</a></li>
              <li><a href="pricing.html">Pricing</a></li>
              <li><a href="quick-start.html">Quick start</a></li>
              <li><a href="#">Integrations</a></li>
              <li><a href="#">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="about.html">About</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Docs</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Octopad Labs, Inc.</span>
          <span>Made for teams who ship.</span>
        </div>
      </div>
    </footer>
  `;

  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.outerHTML = headerHtml;
  if (footerSlot) footerSlot.outerHTML = footerHtml;
})();
