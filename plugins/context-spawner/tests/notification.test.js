// tests/notification.test.js
describe('Notification Handler', () => {
  test('should format notification with state summary', () => {
    const { formatNotification } = require('../lib/notification');
    const state = {
      metadata: {
        repository: 'test-repo',
        contextUsageAtCapture: '67%'
      },
      tasks: [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'in_progress' }
      ],
      fileSnapshot: {
        modifiedFiles: ['file1.js', 'file2.js']
      }
    };

    const notification = formatNotification(state);

    expect(notification).toContain('test-repo');
    expect(notification).toContain('67%');
    expect(notification).toContain('2個待辦');
    expect(notification).toContain('2個已修改文件');
  });

  test('should include filepath in notification', () => {
    const { formatNotification } = require('../lib/notification');
    const state = {
      metadata: { repository: 'test-repo' }
    };

    const notification = formatNotification(state, '/path/to/state.json');

    expect(notification).toContain('state.json');
  });
});
