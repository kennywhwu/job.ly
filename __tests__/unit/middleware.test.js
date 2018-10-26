/** Middleware for handling req authorization for routes. */

const jwt = require('jsonwebtoken');
const { SECRET } = require('../../config.js');
const {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureIsAdmin
} = require('../../middleware/authMiddleware');

function next(obj) {
  return obj;
}

// Test ensureLoggedIn method
describe('ensureLoggedIn()', () => {
  it('should return error if not logged in', function() {
    expect(ensureLoggedIn({}, {}, next)).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
  });

  it('should not error if logged in', function() {
    expect(
      ensureLoggedIn(
        {
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6eyJ1c2VybmFtZSI6Imtlbm55MSIsInBhc3N3b3JkIjoiJDJiJDEwJEtTdUhLUlNxRExyRHFxbkp4RTE3dS5EYVBaYzY0c3FPMS8uVVc4R1hodjU3L0V2djJBNXltIiwiaXNfYWRtaW4iOnRydWV9LCJpYXQiOjE1NDA1NzE1MTF9.WJN_UO5ouLKiGwT-Bbckf30Y3XuQStxNmaGtd9XvFAc'
          }
        },
        {},
        next
      )
    ).toBeUndefined();
  });
});

// Test ensureCorrectUser method
describe('ensureCorrectUser()', () => {
  it('should return error if not logged in as current user', function() {
    // Test not logged in at all
    expect(
      ensureCorrectUser({ params: { username: 'kenny1' } }, {}, next)
    ).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
    // Test if logged in as a different user
    expect(
      ensureCorrectUser(
        {
          params: { username: 'kenny1' },
          username: 'glenn',
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NDA1Nzk5NjF9._jL7ynHSEZbwBrIb01ogs3NnyrbNywjGisFVV4o172o'
          }
        },
        {},
        next
      )
    ).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
  });

  it('should not error if logged in as current user', function() {
    expect(
      ensureCorrectUser(
        {
          params: { username: 'kenny1' },
          username: 'kenny1',
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imtlbm55MSIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NDA1ODAxODl9.Ppi2rBRoNkF3KoQWCBwyxnIk7Y4PD6iMxvL020nff_g'
          }
        },
        {},
        next
      )
    ).toBeUndefined();
  });
});

// Test ensureCorrectUser method
describe('ensureCorrectUser()', () => {
  it('should return error if not logged in as current user', function() {
    // Test not logged in at all
    expect(
      ensureCorrectUser({ params: { username: 'kenny1' } }, {}, next)
    ).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
    // Test if logged in as a different user
    expect(
      ensureCorrectUser(
        {
          params: { username: 'kenny1' },
          username: 'glenn',
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NDA1Nzk5NjF9._jL7ynHSEZbwBrIb01ogs3NnyrbNywjGisFVV4o172o'
          }
        },
        {},
        next
      )
    ).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
  });
  // Test if logged in as current user
  it('should not error if logged in as current user', function() {
    expect(
      ensureCorrectUser(
        {
          params: { username: 'kenny1' },
          username: 'kenny1',
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imtlbm55MSIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NDA1ODAxODl9.Ppi2rBRoNkF3KoQWCBwyxnIk7Y4PD6iMxvL020nff_g'
          }
        },
        {},
        next
      )
    ).toBeUndefined();
  });
});

/** Middleware: Requires is_admin is true for user. */

// Test ensureIsAdmin method
describe('ensureIsAdmin()', () => {
  it('should return error if not logged in as admin', function() {
    // Test not logged in at all
    expect(ensureIsAdmin({}, {}, next)).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
    // Test if logged in as a non-admin
    expect(
      ensureIsAdmin(
        {
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NDA1Nzk5NjF9._jL7ynHSEZbwBrIb01ogs3NnyrbNywjGisFVV4o172o'
          }
        },
        {},
        next
      )
    ).toEqual({
      status: 401,
      message: 'Unauthorized'
    });
  });
  // Test if logged in as admin
  it('should not error if logged in as admin', function() {
    expect(
      ensureIsAdmin(
        {
          body: {
            _token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imtlbm55MSIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NDA1ODAxODl9.Ppi2rBRoNkF3KoQWCBwyxnIk7Y4PD6iMxvL020nff_g'
          }
        },
        {},
        next
      )
    ).toBeUndefined();
  });
});
