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
    iconNew: 'modules/quest-log/icons/MainNew.png',
    iconActive: 'modules/quest-log/icons/MainProgress.png',
    iconComplete: 'modules/quest-log/icons/MainComplete.png',
  },
  {
    name: 'Side Quest',
    pattern: /(Side )?Quest: /i,
    iconNew: 'modules/quest-log/icons/SideNew.png',
    iconActive: 'modules/quest-log/icons/SideProgress.png',
    iconComplete: 'modules/quest-log/icons/SideComplete.png',
  }
]

/**
 * This hook is fired when rendering Foundry's
 * journal sidebar interface.
 * 
 * @param {JournalDirectory} app - https://foundryvtt.com/api/JournalDirectory.html
 * @param {jQuery} html 
 * @param {*} data 
 */
Hooks.on("renderJournalDirectory", (app, html, data) => {    
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
    let icon = questType.iconNew;

    if (j.name.match(ACTIVE_PATTERN)) {
      statuses.push('In Progress');
      icon = questType.iconActive;
    } else if (j.name.match(COMPLETE_PATTERN)) {
      statuses.push('Complete');
      icon = questType.iconComplete;
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
        ${questType.name} ${statuses.length && `(${statuses.join(', ')})`}
      </span>
    `);
  });
});

