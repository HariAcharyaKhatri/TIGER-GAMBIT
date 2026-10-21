/**
 * BAGH-CHAL: LEADERBOARD & RECENT MATCHES
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const Storage = window.BaghChal.Storage;
  const DOM = window.BaghChal.DOM;
  const H = window.BaghChal.Helpers;

  const Leaderboard = {
    render(containerId = 'leaderboardContainer') {
      const container = DOM.byId(containerId);
      if (!container) return;

      const entries = Storage.getLeaderboard();
      const history = Storage.getMatchHistory();

      let rowsHtml = '';
      entries.forEach((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        const winRate = item.winRate != null ? item.winRate : (item.result === 'win' ? 100 : 0);
        rowsHtml += `
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 12px 14px; font-weight: 700; color: var(--color-gold-400);">${medal}</td>
            <td style="padding: 12px 14px; font-weight: 600;">${H.escapeHTML(item.player)}</td>
            <td style="padding: 12px 14px; text-transform: capitalize; color: var(--text-secondary);">${H.escapeHTML(item.difficulty || item.mode || 'Local')}</td>
            <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #48bb78;">${winRate}%</td>
          </tr>
        `;
      });

      let historyRows = '';
      if (history.length === 0) {
        historyRows = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No match records yet. Play your first match!</td></tr>`;
      } else {
        history.slice(0, 10).forEach(m => {
          const resBadge = m.isDraw ? '<span class="badge" style="background:#4a5568;">DRAW</span>' :
                           m.playerWon ? '<span class="badge badge-gold">VICTORY</span>' :
                           '<span class="badge" style="background:rgba(229,62,62,0.2);color:#fc8181;">DEFEAT</span>';
          const sideText = m.playerSide === 'tigers' ? '🐅 Tigers' : '🐐 Goats';
          const dateStr = new Date(m.date).toLocaleDateString();

          historyRows += `
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 10px 14px; font-size: 0.85rem; color: var(--text-muted);">${dateStr}</td>
              <td style="padding: 10px 14px; font-weight: 600;">${sideText}</td>
              <td style="padding: 10px 14px; color: var(--text-secondary); text-transform: capitalize;">${m.mode} (${m.difficulty || 'Local'})</td>
              <td style="padding: 10px 14px;">${resBadge}</td>
              <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-size: 0.85rem;">${m.movesCount || 0} moves</td>
            </tr>
          `;
        });
      }

      container.innerHTML = `
        <div style="background: var(--bg-surface-elevated); padding: 12px 16px; border-radius: var(--radius-md); border-left: 4px solid var(--color-gold-400); margin-bottom: 24px; font-size: 0.85rem; color: var(--text-secondary);">
          ℹ️ <strong>Notice:</strong> This leaderboard displays your local achievements and offline benchmark rankings. For a global real-time cloud leaderboard, connect a Firebase or Supabase backend.
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <h3 class="title-serif" style="font-size: 1.25rem; margin-bottom: 14px; color: var(--color-gold-300);">Hall of Strategists</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-strong); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Rank</th>
                  <th style="padding: 10px 14px;">Strategist</th>
                  <th style="padding: 10px 14px;">Level</th>
                  <th style="padding: 10px 14px; text-align: right;">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3 class="title-serif" style="font-size: 1.25rem; margin-bottom: 14px; color: var(--color-gold-300);">Recent Match History</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-strong); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Date</th>
                  <th style="padding: 10px 14px;">Played As</th>
                  <th style="padding: 10px 14px;">Match Type</th>
                  <th style="padding: 10px 14px;">Outcome</th>
                  <th style="padding: 10px 14px; text-align: right;">Moves</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  };

  window.BaghChal.Leaderboard = Leaderboard;
})(window);
