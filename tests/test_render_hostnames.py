"""Render's trusted runtime hostname must not remove the custom-host guard."""
import os
import unittest
from unittest.mock import patch
import server

class RenderHostnamesTests(unittest.TestCase):
 def test_render_hostname_and_custom_domain_are_both_allowed(self):
  with patch.dict(os.environ,{'APP_HOSTNAME':'api.example.com','RENDER_EXTERNAL_HOSTNAME':'service.onrender.com'}):
   self.assertEqual(server.public_hostnames(),{'api.example.com','service.onrender.com'})
 def test_empty_environment_does_not_invent_a_public_host(self):
  with patch.dict(os.environ,{'APP_HOSTNAME':' ','RENDER_EXTERNAL_HOSTNAME':''}):
   self.assertEqual(server.public_hostnames(),set())
