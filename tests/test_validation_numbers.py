import unittest
from validation import validate, unique_json_object, validate_json_unicode


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


class JSONIntegrityTests(unittest.TestCase):
    def test_duplicate_keys_are_rejected_at_each_json_object_depth(self):
        import json
        for raw in ('{"x":1,"x":2}','{"nested":[{"x":1,"x":2}]}','{"x":null,"x":false}'):
            with self.subTest(raw=raw),self.assertRaisesRegex(ValueError,'duplicate keys'):
                json.loads(raw,object_pairs_hook=unique_json_object)
        self.assertEqual(json.loads('{"a":{"x":1},"b":{"x":2}}',object_pairs_hook=unique_json_object),{'a':{'x':1},'b':{'x':2}})


class JSONUnicodeTests(unittest.TestCase):
    def test_lone_surrogates_are_rejected_in_values_arrays_and_object_keys(self):
        for value in ({'text':'\ud800'},{'items':['\udfff']},{'\ud800':'value'}):
            with self.subTest(value=repr(value)),self.assertRaisesRegex(ValueError,'valid Unicode'):
                validate_json_unicode(value)

    def test_real_unicode_and_decoded_surrogate_pairs_remain_supported(self):
        import json
        value=json.loads('{"text":"\\ud83d\\ude00"}')
        validate_json_unicode(value)
        self.assertEqual(value['text'],'😀')
        validate_json_unicode({'العربية':['😀','Résumé','中文',None,False,123]})
