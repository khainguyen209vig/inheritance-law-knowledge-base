(defrule project-conflicting-heir-rank
  (declare (salience 70))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value conflict) (derivations ?rule))))

(defrule project-first-heir-rank
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id ?rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict)))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value rank-1) (derivations ?rule))))

(defrule project-second-heir-rank
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2) (rule-id ?rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict)))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value rank-2) (derivations ?rule))))

(defrule project-third-heir-rank
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3) (rule-id ?rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict)))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value rank-3) (derivations ?rule))))

(defrule project-called-to-inherit
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value ?value&true|false) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate called-to-inherit)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate called-to-inherit) (value ?value) (derivations ?rule))))

(defrule project-active-heir-rank-one
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value 1) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?case-id) (module heir-rank) (predicate active-heir-rank) (value rank-1) (derivations ?rule))))

(defrule project-active-heir-rank-two
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value 2) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?case-id) (module heir-rank) (predicate active-heir-rank) (value rank-2) (derivations ?rule))))

(defrule project-active-heir-rank-three
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value 3) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?case-id) (module heir-rank) (predicate active-heir-rank) (value rank-3) (derivations ?rule))))

(defrule project-equal-share-principle
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate equal-share-principle-applies) (value true) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?case-id) (module heir-rank) (predicate equal-share-principle-applies) (value true) (derivations ?rule))))

(defrule project-unknown-called-to-inherit
  (declare (salience -90))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1|2|3))
  (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit)))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate called-to-inherit)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate called-to-inherit) (value unknown) (derivations SYSTEM-INCOMPLETE))))

(defrule project-unknown-heir-rank
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate relationship-at-opening))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value unknown) (derivations SYSTEM-INCOMPLETE))))
