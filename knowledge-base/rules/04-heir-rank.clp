; First-rank classification from directed family-graph edges (Article 651.1.a).

(defrule R-C01-spouse
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate spouse-at-opening) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-biological-parent
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate biological-parent-of) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-adoptive-parent
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate adoptive-parent-of) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-biological-child
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?person))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-adoptive-child
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate adoptive-parent-of) (value ?person))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))
