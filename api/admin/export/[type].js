// API endpoint for data export functionality

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { type } = req.query;

    if (type === 'users') {
      // Mock CSV data for users export
      const csvData = [
        'ID,Email,Role,Created At,Last Login,Status',
        '1,user1@example.com,participant,2025-01-01,2025-06-28,active',
        '2,user2@example.com,researcher,2025-01-15,2025-06-29,active',
        '3,user3@example.com,admin,2025-02-01,2025-06-29,active',
        '4,user4@example.com,participant,2025-03-01,2025-06-27,inactive'
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      return res.status(200).send(csvData);
    }

    if (type === 'studies') {
      // Mock CSV data for studies export
      const csvData = [
        'ID,Title,Creator,Status,Created At,Participants,Completion Rate',
        '1,Website Usability Test,researcher@example.com,active,2025-06-01,45,78%',
        '2,Mobile App Testing,researcher@example.com,completed,2025-05-15,67,92%',
        '3,Brand Perception Study,researcher2@example.com,draft,2025-06-20,0,0%',
        '4,User Journey Analysis,researcher@example.com,active,2025-06-10,23,65%'
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=studies-export.csv');
      return res.status(200).send(csvData);
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid export type. Must be "users" or "studies"'
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
}
