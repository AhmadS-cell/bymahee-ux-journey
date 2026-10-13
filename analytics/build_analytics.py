"""Rebuild the public aggregate dashboard from its maintained template/data."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
data=json.loads((root/'data.json').read_text(encoding='utf-8'))
encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
template=(root/'index.template.html').read_text(encoding='utf-8').replace('__ORGANIC_SECTION__',(root/'organic-search.html').read_text(encoding='utf-8')).replace('__BASKET_SECTION__',(root/'basket-summary.html').read_text(encoding='utf-8')).replace('__CHANNEL_MOTION__',(root/'channel-motion.html').read_text(encoding='utf-8'))
template=template.replace('__COTTON_SEARCH_EVIDENCE__',(root/'cotton-search-evidence.html').read_text(encoding='utf-8'))
(root/'index.html').write_text(template.replace('__DATA__',encoded),encoding='utf-8')
print('Built aggregate analytics dashboard.')
