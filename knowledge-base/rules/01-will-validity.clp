; Domain rules for module 1: basic validity of a will.
; These rules depend only on domain knowledge. UI/module selection and trace
; formatting are intentionally handled elsewhere.

; Transitional path for written wills whose detailed formal observations have
; not been decomposed yet. This adapter is explicit and can be retired when the
; rules for Articles 627-636 are represented in full.
(defrule FORM-ASSESSMENT-ACCEPTED
  (declare (salience 500))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value written))
  (asserted-fact
    (fact-id ?form-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate formal-defect)
    (value not-detected))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id FORM-ASSESSMENT-ACCEPTED)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id FORM-ASSESSMENT-ACCEPTED)
    (supports ?type-fact-id ?form-fact-id))))

(defrule R-B01-valid-intention
  (declare (salience 500))
  (asserted-fact
    (fact-id ?mental-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state)
    (value lucid))
  (asserted-fact
    (fact-id ?influence-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate undue-influence)
    (value none))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true)
    (rule-id R-B01)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true)
    (rule-id R-B01)
    (supports ?mental-fact-id ?influence-fact-id))))

(defrule R-B02-valid-content-and-form
  (declare (salience 500))
  (asserted-fact
    (fact-id ?content-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate prohibited-content)
    (value not-detected))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id ?form-rule-id))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true)
    (rule-id R-B02)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true)
    (rule-id R-B02)
    (supports ?content-fact-id ?form-rule-id))))

(defrule R-B03-valid-will
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true)
    (rule-id R-B03)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true)
    (rule-id R-B03)
    (supports valid-intention=true valid-content-and-form=true))))

; The OR condition from R-B04 is represented as separate production rules.
(defrule R-B04-invalid-will-no-mental-capacity
  (declare (salience 500))
  (asserted-fact
    (fact-id ?mental-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state)
    (value not-lucid))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)
    (supports ?mental-fact-id))))

(defrule R-B04-invalid-will-undue-influence
  (declare (salience 500))
  (asserted-fact
    (fact-id ?influence-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate undue-influence)
    (value ?influence&deception|threat))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)
    (supports ?influence-fact-id))))

; A testator from 15 to under 18 must make a written will and obtain consent
; from a parent or guardian. R-B05 derives a form requirement, not the final
; legal validity of the whole will.
(defrule R-B05-minor-special-requirement
  (declare (salience 500))
  (asserted-fact
    (fact-id ?age-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-age)
    (value ?age&:(and (>= ?age 15) (< ?age 18))))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value written))
  (asserted-fact
    (fact-id ?consent-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate guardian-consent)
    (value true))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value satisfied)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value satisfied)
    (rule-id R-B05)
    (supports ?age-fact-id ?type-fact-id ?consent-fact-id))))

(defrule R-B05-minor-form-requirements
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value satisfied)
    (rule-id R-B05))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id R-B05)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id R-B05)
    (supports minor-special-requirement=satisfied))))

(defrule R-B06-minor-will-not-written
  (declare (salience 500))
  (asserted-fact
    (fact-id ?age-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-age)
    (value ?age&:(and (>= ?age 15) (< ?age 18))))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value ?type&~written))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value failed)
    (rule-id R-B06)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value failed)
    (rule-id R-B06)
    (supports ?age-fact-id ?type-fact-id))))

(defrule R-B06-minor-without-consent
  (declare (salience 500))
  (asserted-fact
    (fact-id ?age-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-age)
    (value ?age&:(and (>= ?age 15) (< ?age 18))))
  (asserted-fact
    (fact-id ?consent-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate guardian-consent)
    (value false))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value failed)
    (rule-id R-B06)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value failed)
    (rule-id R-B06)
    (supports ?age-fact-id ?consent-fact-id))))

(defrule R-B06-invalid-minor-will
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value failed)
    (rule-id R-B06))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B06)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B06)
    (supports minor-special-requirement=failed))))

; R-B07 is split by the OR condition that identifies the protected testator.
(defrule R-B07-physical-limitation-form
  (declare (salience 500))
  (asserted-fact
    (fact-id ?condition-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate physical-limitation)
    (value true))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value written))
  (asserted-fact
    (fact-id ?witness-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate prepared-by-witness)
    (value true))
  (asserted-fact
    (fact-id ?certification-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate notarized-or-certified)
    (value true))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate accessibility-form-requirement)
    (value satisfied)
    (rule-id R-B07)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate accessibility-form-requirement)
    (value satisfied)
    (rule-id R-B07)
    (supports ?condition-fact-id ?type-fact-id ?witness-fact-id ?certification-fact-id))))

(defrule R-B07-illiterate-testator-form
  (declare (salience 500))
  (asserted-fact
    (fact-id ?condition-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-literacy)
    (value illiterate))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value written))
  (asserted-fact
    (fact-id ?witness-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate prepared-by-witness)
    (value true))
  (asserted-fact
    (fact-id ?certification-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate notarized-or-certified)
    (value true))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate accessibility-form-requirement)
    (value satisfied)
    (rule-id R-B07)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate accessibility-form-requirement)
    (value satisfied)
    (rule-id R-B07)
    (supports ?condition-fact-id ?type-fact-id ?witness-fact-id ?certification-fact-id))))

(defrule R-B07-accessibility-form-requirements
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate accessibility-form-requirement)
    (value satisfied)
    (rule-id R-B07))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id R-B07)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id R-B07)
    (supports accessibility-form-requirement=satisfied))))

(defrule R-B08-oral-will-automatically-revoked
  (declare (salience 500))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value oral))
  (asserted-fact
    (fact-id ?alive-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-alive-after-three-months)
    (value true))
  (asserted-fact
    (fact-id ?mental-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state-after-three-months)
    (value lucid))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-effect-status)
    (value automatically-revoked)
    (rule-id R-B08)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-effect-status)
    (value automatically-revoked)
    (rule-id R-B08)
    (supports ?type-fact-id ?alive-fact-id ?mental-fact-id)))
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-currently-effective)
    (value false)
    (rule-id R-B08)
    (supports will-effect-status=automatically-revoked))))

(defrule R-B09-valid-oral-form
  (declare (salience 500))
  (asserted-fact
    (fact-id ?type-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value oral))
  (asserted-fact
    (fact-id ?count-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate witness-count)
    (value ?count&:(>= ?count 2)))
  (asserted-fact
    (fact-id ?recorded-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate witnesses-recorded)
    (value true))
  (asserted-fact
    (fact-id ?signed-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate witnesses-signed)
    (value true))
  (asserted-fact
    (fact-id ?certified-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate certified-within-days)
    (value ?days&:(and (>= ?days 0) (<= ?days 5))))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate oral-form-requirement)
    (value satisfied)
    (rule-id R-B09)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate oral-form-requirement)
    (value satisfied)
    (rule-id R-B09)
    (supports ?type-fact-id ?count-fact-id ?recorded-fact-id ?signed-fact-id ?certified-fact-id))))

(defrule R-B09-oral-form-requirements
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate oral-form-requirement)
    (value satisfied)
    (rule-id R-B09))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id R-B09)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)
    (rule-id R-B09)
    (supports oral-form-requirement=satisfied))))
