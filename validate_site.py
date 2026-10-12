"""Check both screens, generated sources, assets and aggregate data."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse,unquote
import json,re
root=Path(__file__).resolve().parent
class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        for key in ['src','href','data-image']:
            if a.get(key):self.refs.append(a[key])
cache={}
for file in [root/'index.html',root/'analytics/index.html']:
    p=Page();p.feed(file.read_text(encoding='utf-8'));cache[file.resolve()]=p
    assert len(p.ids)==len(set(p.ids)),file
for file,p in list(cache.items()):
    for ref in p.refs:
        u=urlparse(ref)
        if u.scheme or u.netloc:continue
        target=(file.parent/unquote(u.path)).resolve() if u.path else file
        assert target.exists(),(file,ref)
        assert target.is_relative_to(root),(file,ref)
        if u.fragment and target.suffix=='.html':assert unquote(u.fragment) in cache[target].ids,(file,ref)
for match in re.findall(r"link:'([^']+)'",(root/'analytics/dashboard.js').read_text(encoding='utf-8')):
    u=urlparse(match);target=(root/'analytics'/u.path).resolve();assert target.exists(),match
    if u.fragment:assert u.fragment in cache[target].ids,match
data=json.loads((root/'analytics/data.json').read_text(encoding='utf-8'))
assert len(data['products'])==228
assert sum(r['purchases'] for r in data['sources'])==118
assert sum(r['purchases'] for r in data['channels'])==118
assert abs(sum(r['revenue'] for r in data['sources'])-58171.08)<.01
assert data['funnel_closed']['steps']==[1787,870,118,14,8]
assert data['funnel_open']['steps']==[1785,874,118,14,10]
assert sum(r['units'] for r in data['products'])==270
assert not (root/'analytics/evidence').exists()
assert not any(k in data['metadata'] for k in ['account_id','property_id','stream_id','measurement_id'])
assert not data['sources_manifest']
review=json.loads((root/'analytics/data-review.json').read_text(encoding='utf-8'))
assert all(c['status']=='pass' for c in review['checks'])
html=(root/'analytics/index.html').read_text(encoding='utf-8')
embedded=re.search(r'<script id="report-data" type="application/json">(.*?)</script>',html,re.S)
assert json.loads(embedded[1])==data
print('PASS: both screens, local assets/anchors, source data, 21 review checks, aggregate publication scope.')
