import unittest
from validation import validate


class NumericValidationTests(unittest.TestCase):
    def test_large_json_integers_receive_schema_bounds_without_float_conversion(self):
        value=10**400
        for kind in ('integer','number'):
            with self.subTest(kind=kind):
                with self.assertRaisesRegex(ValueError,'above maximum'):
                    validate(value,{'type':kind,'maximum':100})
                with self.assertRaisesRegex(ValueError,'below minimum'):
                    validate(-value,{'type':kind,'minimum':0})
                validate(value,{'type':kind})
                validate(-value,{'type':kind})

    def test_large_integer_in_text_field_is_a_normal_type_error(self):
        with self.assertRaisesRegex(ValueError,'expected type'):
            validate(10**400,{'type':'string'})

    def test_nonfinite_floats_and_booleans_remain_invalid_numbers(self):
        for value in (float('inf'),float('-inf'),float('nan'),True,False):
            with self.subTest(value=value),self.assertRaises(ValueError):
                validate(value,{'type':'number'})
