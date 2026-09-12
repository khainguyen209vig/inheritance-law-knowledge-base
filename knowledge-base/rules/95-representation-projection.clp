(defrule project-adoption-inheritance-basis
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate adoption-inheritance-basis) (value ?relative) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate adoption-inheritance-basis)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate adoption-inheritance-basis) (value true) (derivations ?rule))))

(defrule project-dual-parentage-inheritance-basis
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate dual-parentage-inheritance-basis) (value true) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate dual-parentage-inheritance-basis) (value true) (derivations ?rule))))

(defrule project-step-relationship-inheritance-basis
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate step-relationship-inheritance-basis) (value ?relative) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate step-relationship-inheritance-basis)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate step-relationship-inheritance-basis) (value true) (derivations ?rule))))

(defrule project-ineligible-by-step-relationship
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate eligible-by-step-relationship) (value false) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate eligible-by-step-relationship) (value false) (derivations ?rule))))

(defrule project-step-care-conflict
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate step-care-assessment) (value conflict) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate step-care-assessment) (value conflict) (derivations ?rule))))

(defrule project-representation-result
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value ?value&true|false) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate inherits-by-representation)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate inherits-by-representation) (value ?value) (derivations ?rule))))

(defrule project-unknown-representation
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module representation))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate inherits-by-representation) (value unknown) (derivations SYSTEM-INCOMPLETE))))
