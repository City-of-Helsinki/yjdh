/**
 * Check at compile time that Subtype is a subset of Supertype or not.
 * @warning This works with string literal types, but not necessarily with all types
 * @return Subtype if Subtype is a subset of Supertype, otherwise raise an error.
 */
type Subset<Supertype, Subtype extends Supertype> = Subtype;

export default Subset;
