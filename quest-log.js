const MODULE = 'quest-log';

/**
 * Quest state patterns.
 */
const ACTIVE_PATTERN = /\(((in progress)|(active))\)/i;
const COMPLETE_PATTERN = /\(((completed?)|(done))\)/i;

/**
 * Quest types & icons.
 */
const questTypes = [
  {
    name: 'Main Quest',
    pattern: /Main Quest: /i,
    icon: (status, color) => `modules/quest-log/icons/Main_${status}_${color}.png`,
  },
  {
    name: 'Side Quest',
    pattern: /(Side )?Quest: /i,
    icon: status => `modules/quest-log/icons/Side_${status}.png`,
  }
];

/**
 * Initialize the module.
 */
Hooks.once('init', () => {
  game.settings.register(MODULE, 'color', {
    name: "Color Scheme",
    hint: "The color to use for main quest icons.",
    choices: {Red: "Red", Purple: "Purple", Green: "Green" },
    default: "Red",
    scope: "world",
    config: true,
    type: String,
    onChange: () => ui.sidebar.render(),
  });
});

/**
 * This hook is fired when rendering Foundry's
 * journal sidebar interface.
 * 
 * @param {JournalDirectory} app - https://foundryvtt.com/api/JournalDirectory.html
 * @param {jQuery} html 
 * @param {*} data 
 */
Hooks.on("renderJournalDirectory", (app, html, data) => {    
  const color = game.settings.get(MODULE, 'color');

  app.entities.forEach(j => {
    const questType = questTypes.find(t => j.name.match(t.pattern));
    const isHidden = j.data.permission.default === 0;

    // If it's not a quest, we don't need to do anything...
    if (!questType) {
      return;
    } 

    // If it's not in the log, we don't need to do anything...
    const htmlEntry = html.find(`.directory-item.entity[data-entity-id="${j.id}"]`);
    if (htmlEntry.length !== 1) {
      return;
    }

    const statuses = [];

    let icon = questType.icon('New', color);
    if (j.name.match(ACTIVE_PATTERN)) {
      statuses.push('In Progress');
      icon = questType.icon('Progress', color);
    } else if (j.name.match(COMPLETE_PATTERN)) {
      statuses.push('Complete');
      icon = questType.icon('Complete', color);
    }

    if (isHidden) {
      statuses.push('Hidden');
    }

    const title = j.name
      .replace(questType.pattern, '')
      .replace(ACTIVE_PATTERN, '')
      .replace(COMPLETE_PATTERN, '')

    // Prepend with quest icon:
    htmlEntry.prepend(`
      <img
        class="journal-quest-log-icon"
        src="${icon}" title="${questType.name}"
        style="${isHidden ? 'opacity: 0.5' : ''}; "
      />
    `);

    // Replace title & add subtitle:
    htmlEntry.find('.entity-name a').text(title);
    htmlEntry.find('h4.entity-name').append(`
      <span class="journal-quest-log-subtitle">
        ${questType.name} ${statuses.length > 0 ? `(${statuses.join(', ')})` : ''}
      </span>
    `);
  });
});

