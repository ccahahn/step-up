-- Optional. The three things already on the list, plus one closed out so the
-- savings tally has something to show. Safe to skip.

insert into items (id, date, what, usual, spent, move, who) values
  (gen_random_uuid(), '2026-09-07', 'Threading',                  50, null, 'do it at home',              ''),
  (gen_random_uuid(), '2026-09-10', 'Eat with Supriya',           80, null, 'coffee instead of dinner',   ''),
  (gen_random_uuid(), '2026-09-11', 'Snacks for girls',           50, null, 'fruit and pancakes at home', ''),
  (gen_random_uuid(), '2026-09-02', 'Coffee run before practice', 24,    9, 'fill the thermos at home',   '');
