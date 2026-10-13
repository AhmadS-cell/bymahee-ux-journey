"""Check both screens, generated sources, assets and aggregate data."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse,unquote
import json,re,csv
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
assert data['totals']['sessions']==10340 and data['totals']['total_users']==8092
assert [next(r for r in data['events'] if r['name']==key)['users'] for key in ['session_start','view_item','add_to_cart','begin_checkout','purchase']]==[7978,3106,497,140,114]
assert next(r for r in data['events'] if r['name']=='session_start')['events']-next(r for r in data['funnel_period_events'] if r['name']=='session_start')['events']==7509
assert sum(r['units'] for r in data['products'])==270
assert not (root/'analytics/evidence').exists()
assert not any(k in data['metadata'] for k in ['account_id','property_id','stream_id','measurement_id'])
assert not data['sources_manifest']
review=json.loads((root/'analytics/data-review.json').read_text(encoding='utf-8'))
assert all(c['status']=='pass' for c in review['checks'])
tracking=json.loads((root/'analytics/tracking-review.json').read_text(encoding='utf-8'))
assert tracking==data['tracking_review']
assert tracking['matched_comparison']['period_from']==data['metadata']['funnel_from']
assert tracking['matched_comparison']['period_to']==data['metadata']['funnel_to']
assert tracking['matched_comparison']['independent_users']==[next(r for r in data['funnel_period_events'] if r['name']==k)['users'] for k in ['view_item','add_to_cart','begin_checkout','purchase']]
assert tracking['matched_comparison']['closed_sequential_users']==data['funnel_closed']['steps'][1:]
assert not tracking['same_session_90_day_funnel_verified'] and not tracking['applied_to_store']
buyers=json.loads((root/'analytics/buyer-profile.json').read_text(encoding='utf-8'))
assert buyers==data['buyer_profile']
assert buyers['period_from']==data['metadata']['period_from'] and buyers['period_to']==data['metadata']['period_to']
for dimension,rows in buyers['dimensions'].items():
    assert sum(r['purchases'] for r in rows)==data['totals']['purchases'],dimension
    assert abs(sum(r['revenue'] for r in rows)-data['totals']['purchase_revenue'])<.02,dimension
    assert all(abs(r['user_purchase_rate']-100*r['buyers']/r['users'])<.000001 if r['users'] else r['user_purchase_rate'] is None for r in rows),dimension
    if dimension=='cities':assert all(abs(r['user_purchase_rate']-r['native_user_purchase_rate'])<=.0051 for r in rows if r['users'])
cityrows=buyers['dimensions']['cities']
eligible=[r for r in cityrows if r['name']!='(not set)' and r['users']>=buyers['thresholds']['min_traffic'] and r['buyers']>=buyers['thresholds']['min_purchases_for_positive_ranking']]
assert max(eligible,key=lambda r:r['user_purchase_rate'])['name']=='Jeddah'
assert not any(r['name'] in ['Jazan','Cairo'] for r in eligible)
assert sum(r['buyers'] for r in cityrows)==117 and buyers['total_buyers']==114
organic=json.loads((root/'analytics/organic-search.json').read_text(encoding='utf-8'))
assert organic==data['organic_search']
assert organic['period_from']==data['metadata']['period_from'] and organic['period_to']==data['metadata']['period_to']
assert organic['organic_source']==next(r for r in data['sources'] if r['name']=='google / organic')
assert organic['paid_source']==next(r for r in data['sources'] if r['name']=='google / cpc')
assert organic['organic_source']['session_purchase_rate']==2.19
for rows in [organic['landing'],organic['landing_groups']]:
    for k,v in [('sessions',593),('purchases',13),('revenue',6528)]:assert abs(sum(r[k] for r in rows)-v)<.01,(k,v)
assert organic['landing_original_rows']==118 and organic['landing_private_rows']==9
assert len(organic['landing'])==110
assert not any(re.search(r'/(account|checkout)(/|$)',r['path']) for r in organic['landing'])
assert all(r['session_purchase_rate'] is None for r in organic['landing'] if r['private_aggregate'])
assert organic['search_console']['link_count']==0 and organic['search_console']['queries'] is None
assert organic['google_ads']['link_count']==1 and not organic['google_ads']['cost_verified']
assert not organic['query_purchase_join_verified'] and not organic['store_changes_applied']
with (root/'analytics/google-organic-landing.csv').open(encoding='utf-8-sig',newline='') as f:organic_csv=list(csv.DictReader(f))
assert [r['path'] for r in organic_csv]==[r['path'] for r in organic['landing']]
for k,v in [('sessions',593),('purchases',13),('revenue',6528)]:assert abs(sum(float(r[k]) for r in organic_csv)-v)<.01
assert not any(re.search(r'/(account|checkout)(/|$)',r['path']) for r in organic_csv)
basket=json.loads((root/'analytics/basket-summary.json').read_text(encoding='utf-8'))
catalog=json.loads((root/'analytics/product-catalog.json').read_text(encoding='utf-8'))
assert basket==data['basket_summary'] and catalog==data['product_catalog']
assert basket['period_from']==data['metadata']['period_from'] and basket['period_to']==data['metadata']['period_to']
assert abs(basket['average_order_value']-58171.08/118)<.000001
assert abs(basket['average_sold_unit_revenue']-65130/270)<.000001
assert abs(basket['average_units_per_purchase']-270/118)<.000001
assert not basket['order_item_distribution_verified'] and not basket['store_order_match_verified']
assert not basket['physical_pieces_or_distinct_product_types']
assert set(r['analytics_name'] for r in catalog['matches']+catalog['unmatched'])==set(r['name'] for r in data['products'])
assert len(catalog['matches'])==180 and len(catalog['unmatched'])==48
assert sum(r['is_multi'] for r in catalog['matches'])==3
for m in catalog['matches']:
    for v in m['variants']:
        assert v['product_id'] in m['item_ids']
        assert v['url'].startswith('https://bymahee.com/ar/') and v['url'].endswith('/p'+v['product_id'])
        assert v['image'].startswith('assets/products/') and (root/'analytics'/v['image']).is_file()
with (root/'analytics/products.csv').open(encoding='utf-8-sig',newline='') as f:product_csv=list(csv.DictReader(f))
assert len(product_csv)==228
for r in product_csv:
    if float(r['units']):assert abs(float(r['average_sold_unit_revenue'])-float(r['revenue'])/float(r['units']))<=.0051
    else:assert not r['average_sold_unit_revenue']
flow=json.loads((root/'analytics/channel-motion.json').read_text(encoding='utf-8'))
assert flow==data['channel_motion']
assert flow['period_from']==data['metadata']['period_from'] and flow['period_to']==data['metadata']['period_to']
keys=[key for g in flow['groups'] for key in g['source_names']]
assert len(keys)==len(set(keys))==24 and set(keys)==set(r['name'] for r in data['sources'])
for g in flow['groups']:
    rr=[r for r in data['sources'] if r['name'] in g['source_names']]
    for key in ['sessions','purchases','revenue']:assert abs(g[key]-sum(r[key] for r in rr))<.01
assert sum(g['sessions'] for g in flow['groups'])==9859
assert sum(g['purchases'] for g in flow['groups'])==118
assert abs(sum(g['revenue'] for g in flow['groups'])-58171.08)<.01
assert flow['native_sessions']==10340 and flow['unreconciled_session_gap']==481
assert not any(flow[k] for k in ['matched_journey','line_width_proportional','particle_count_proportional'])
html=(root/'analytics/index.html').read_text(encoding='utf-8')
embedded=re.search(r'<script id="report-data" type="application/json">(.*?)</script>',html,re.S)
assert json.loads(embedded[1])==data
print(f"PASS: both screens, local assets/anchors, source data, {len(review['checks'])} review checks, aggregate publication scope.")
