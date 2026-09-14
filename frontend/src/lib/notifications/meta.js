/** Icon + accent per notification type, shared by the toast popup and the activity list. */
export const NOTIFICATION_META = {
  like: { icon: 'heart', colorKey: 'red' },
  comment: { icon: 'chatbubble', colorKey: 'blue' },
  share: { icon: 'arrow-redo', colorKey: 'green' },
  new_post: { icon: 'newspaper', colorKey: 'primary' },
  new_reel: { icon: 'play-circle', colorKey: 'red' },
  new_story: { icon: 'add-circle', colorKey: 'yellow' },
};

export function metaFor(type) {
  return NOTIFICATION_META[type] ?? { icon: 'notifications', colorKey: 'primary' };
}
