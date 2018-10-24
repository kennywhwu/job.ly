const partialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', function() {
    // FIXME: write real tests!
    // expect(false).toEqual(true);
    expect(
      partialUpdate(
        'companies',
        { description: 'Doing great!', logo_url: 'http://netflix.com' },
        'handle',
        'NFLX'
      )
    ).toEqual({
      query:
        'UPDATE companies SET description=$1, logo_url=$2 WHERE handle=$3 RETURNING *',
      values: ['Doing great!', 'http://netflix.com', 'NFLX']
    });
  });
});
