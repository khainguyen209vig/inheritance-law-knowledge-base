(defrule project-compulsory-candidate
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value ?value&true|false) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate compulsory-heir-candidate)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate compulsory-heir-candidate) (value ?value) (derivations ?rule))))

(defrule project-compulsory-heir-status
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value ?value&true|false) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate compulsory-heir)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate compulsory-heir) (value ?value) (derivations ?rule))))

(defrule project-unknown-compulsory-candidate
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate compulsory-heir-candidate) (value unknown) (derivations SYSTEM-INCOMPLETE))))

(defrule project-unknown-compulsory-heir-status
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate compulsory-heir) (value unknown) (derivations SYSTEM-INCOMPLETE))))
