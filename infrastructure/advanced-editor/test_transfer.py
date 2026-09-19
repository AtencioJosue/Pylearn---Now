import json
from pathlib import Path
import tempfile
import unittest
from transfer import import_project, export_project, validate

class TransferTests(unittest.TestCase):
    def project(self):
        return {"name":"Demo", "files":[{"path":"src/main.py","content":"print('hola')","encoding":"utf8"},{"path":"data.bin","content":"AP9B","encoding":"base64"}],"folders":["empty"],"packages":[]}

    def test_round_trip_text_binary_and_empty_folder(self):
        with tempfile.TemporaryDirectory(prefix="pylearn-transfer-test-") as tmp:
            root=Path(tmp).resolve()
            source=root/"project.json"
            source.write_text(json.dumps(self.project()),encoding="utf8")
            destination=root/"imported"
            self.assertTrue(destination.is_relative_to(root))
            import_project(source,destination)
            self.assertEqual((destination/"src/main.py").read_text(),"print('hola')")
            self.assertEqual((destination/"data.bin").read_bytes(),bytes([0,255,65]))
            self.assertTrue((destination/"empty").is_dir())
            exported=root/"export.json"
            export_project(destination,exported)
            before,_=validate(self.project())
            after,_=validate(json.loads(exported.read_text()))
            self.assertEqual(before,after)

    def test_malicious_paths_and_conflicts_are_rejected(self):
        for path in ("../outside","/absolute","a/../../outside","a//b","C:\\secret","__pycache__/x"):
            p=self.project();p["files"][0]["path"]=path
            with self.assertRaises(ValueError,msg=path): validate(p)
        p=self.project();p["files"].append({"path":"src","content":"","encoding":"utf8"})
        with self.assertRaises(ValueError): validate(p)

    def test_import_never_overwrites_existing_folder(self):
        with tempfile.TemporaryDirectory(prefix="pylearn-transfer-test-") as tmp:
            root=Path(tmp).resolve()
            source=root/"project.json";source.write_text(json.dumps(self.project()))
            dest=root/"existing";dest.mkdir();(dest/"keep.txt").write_text("keep")
            with self.assertRaises(ValueError): import_project(source,dest)
            self.assertEqual((dest/"keep.txt").read_text(),"keep")

if __name__=="__main__": unittest.main()
