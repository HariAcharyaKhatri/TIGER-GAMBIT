/**
 * BAGH-CHAL: PLAYER STATISTICS DASHBOARD
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const Storage = window.BaghChal.Storage;
  const DOM = window.BaghChal.DOM;

  const Statistics = {
    render(containerId = 'statsContainer') {
      const container = DOM.byId(containerId);
      if (!container) return;

      const stats = Storage.getStats();
      const total = stats.totalMatches;
      const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

      const goatMatches = stats.asGoats.wins + stats.asGoats.losses;
      const goatWinRate = goatMatches > 0 ? Math.round((stats.asGoats.wins / goatMatches) * 100) : 0;

      const tigerMatches = stats.asTigers.wins + stats.asTigers.losses;
      const tigerWinRate = tigerMatches > 0 ? Math.round((stats.asTigers.wins / tigerMatches) * 100) : 0;

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">TOTAL MATCHES</div>
            <div style="font-size: 2.2rem; font-family: var(--font-serif); font-weight: 700; color: var(--color-gold-400); margin: 6px 0;">${total}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${stats.wins}W · ${stats.losses}L · ${stats.draws}D</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">OVERALL WIN RATE</div>
            <div style="font-size: 2.2rem; font-family: var(--font-serif); font-weight: 700; color: #48bb78; margin: 6px 0;">${winRate}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Across all modes</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">GOAT WIN RATE</div>
            <div style="font-size: 2.2rem; font-family: var(--font-serif); font-weight: 700; color: var(--color-goat-500); margin: 6px 0;">${goatWinRate}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${stats.asGoats.wins}W / ${goatMatches} played</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">TIGER WIN RATE</div>
            <div style="font-size: 2.2rem; font-family: var(--font-serif); font-weight: 700; color: var(--color-tiger-500); margin: 6px 0;">${tigerWinRate}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${stats.asTigers.wins}W / ${tigerMatches} played</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <h3 class="title-serif" style="font-size: 1.15rem; margin-bottom: 16px; color: var(--color-gold-300);">AI Difficulty Breakdown</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${this._renderDiffRow('Beginner', stats.byDifficulty.beginner)}
            ${this._renderDiffRow('Easy', stats.byDifficulty.easy)}
            ${this._renderDiffRow('Medium', stats.byDifficulty.medium)}
            ${this._renderDiffRow('Hard', stats.byDifficulty.hard)}
            ${this._renderDiffRow('Expert', stats.byDifficulty.expert)}
          </div>
        </div>
      `;
    },

    _renderDiffRow(label, record) {
      const played = (record ? record.wins + record.losses : 0);
      const rate = played > 0 ? Math.round((record.wins / played) * 100) : 0;
      return `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
            <span style="font-weight: 600;">${label}</span>
            <span style="color: var(--text-muted);">${record ? record.wins : 0} Wins / ${played} Played (${rate}%)</span>
          </div>
          <div style="height: 6px; background: var(--bg-surface-elevated); border-radius: 99px; overflow: hidden;">
            <div style="height: 100%; width: ${rate}%; background: linear-gradient(90deg, var(--color-gold-500), #48bb78);"></div>
          </div>
        </div>
      `;
    }
  };

  window.BaghChal.Statistics = Statistics;
})(window);
