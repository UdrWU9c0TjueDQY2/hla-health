from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'src/dosebeacon/reminder-vs-dose-record/dosebeacon-medication-list-update-notes.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('DVS', str(FONT_DIR / 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DVS-Bold', str(FONT_DIR / 'DejaVuSans-Bold.ttf')))
INK = HexColor('#142837'); MUTED = HexColor('#495a65'); LINE = HexColor('#9aa9b2'); GOLD = HexColor('#f1e5c9'); PALE = HexColor('#edf2f4')
APPLE = 'https://apps.apple.com/us/app/dosebeacon-pill-reminder/id6796910918'
HTML = 'https://udrwu9c0tjuedqy2.github.io/hla-health/dosebeacon/reminder-vs-dose-record/#list-update-notes'
FDA = 'https://www.fda.gov/consumers/consumer-updates/create-and-keep-medication-list-your-health'
c = canvas.Canvas(str(OUT), pagesize=letter, pageCompression=1)
c.setTitle('Medication-list update notes - DoseBeacon companion')
c.setAuthor('Honest Little Apps')
c.setSubject('A blank preparation sheet for a medication-list review conversation; not dosing advice')
W,H = letter; M = 38; R = W-M

def text(x,y,s,size=10,bold=False,color=INK):
    c.setFillColor(color);c.setFont('DVS-Bold' if bold else 'DVS',size);c.drawString(x,y,s)
def wrap(s,x,y,width,size=10.3,leading=15,bold=False,color=MUTED):
    font='DVS-Bold' if bold else 'DVS';words=s.split();buf=''
    for w in words:
        test=(buf+' '+w).strip()
        if pdfmetrics.stringWidth(test,font,size)>width:
            text(x,y,buf,size,bold,color); y-=leading;buf=w
        else:buf=test
    if buf:text(x,y,buf,size,bold,color);y-=leading
    return y
def rule(y,x=M,x2=R):
    c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(x,y,x2,y)
def box(y,title,height=54):
    c.setFillColor(PALE);c.roundRect(M,y-height,R-M,height,5,stroke=0,fill=1)
    text(M+12,y-18,title,10.8,True)

c.setFillColor(INK);c.rect(0,H-19,W,19,stroke=0,fill=1)
text(M,749,'HONEST LITTLE APPS / PRIVATE PAPER COMPANION',8.8,True)
text(M,719,'Medication-list update notes',21,True)
wrap('Prepare one question. Keep the source and revision date visible.',M,696,R-M,11.4,16)
wrap('Use alongside your complete medication list. This sheet does not tell you to start, stop, skip, repeat or change a medicine. Ask your pharmacist or prescriber about unclear instructions.',M,666,R-M,10.2,14)

text(M,612,'1  Identify the versions',13,True)
text(M,590,'List I brought / last revised:',10.5);rule(583,M+172)
text(M,563,'Other source / date (for example, appointment summary):',10.5);rule(546)
text(M,529,'Date prepared:',10.5);rule(522,M+100,M+244)
text(M+265,529,'Review conversation on:',10.5);rule(522,M+408)

text(M,495,'2  Mark one detail to clarify',13,True)
text(M,472,'Item or row on my existing list:',10.5);rule(455)
labels=[('Name',M),('Strength',M+91),('Directions',M+202),('Status',M+328),('Other',M+421)]
for label,x in labels:
    c.setStrokeColor(MUTED);c.rect(x,431,8,8,stroke=1,fill=0);text(x+14,431,label,9.5)
text(M,410,'What differs, or is missing? Copy the source; do not guess.',10.2)
rule(388);rule(367)

text(M,340,'3  Bring a clear question',13,True)
text(M,318,'What do I need the pharmacist or prescriber to confirm?',10.5)
rule(296);rule(275)
text(M,253,'After the conversation: confirmed source / next record update',10.2)
rule(231)
text(M,211,'Current complete list last revised:',10);rule(204,M+206,M+320)
text(M+333,211,'Older copies reviewed?',9.5)
text(M+333,194,'[ ] Done   [ ] Not yet',9.5)

c.setFillColor(GOLD);c.roundRect(M,130,R-M,45,4,stroke=0,fill=1)
wrap('Fictional example: a paper list says "May"; a phone photo says "April". Ask which reflects the latest confirmed instructions. A newer date alone does not prove the contents are current.',M+10,160,R-M-20,9.2,12)

wrap('General guidance: FDA, Create and Keep a Medication List for Your Health. Original worksheet, not an FDA form or endorsement. Full source and text version are on the web companion.',M,112,R-M,8.1,11)
c.linkURL(FDA,(M,88,R,118),relative=0,thickness=0)
rule(79)
text(M,64,'Optional app: DoseBeacon on the App Store',9.2,True)
c.linkURL(APPLE,(M,60,M+280,74),relative=0,thickness=0)
wrap('Honest Little Apps publishes DoseBeacon and this separate free companion. Native app: free limits and optional paid Family features; check Apple for current terms. Keep completed notes private.',M,48,R-M,8.1,11)
c.linkURL(HTML,(M,20,R,41),relative=0,thickness=0)
c.showPage();c.save()

# Keep the embedded fonts' license with the PDF without adding another page.
license_path = Path('/usr/share/doc/fonts-dejavu-core/copyright')
if license_path.exists():
    reader=PdfReader(OUT);writer=PdfWriter();writer.clone_document_from_reader(reader)
    writer.add_attachment('DejaVu-font-license.txt',license_path.read_bytes())
    with OUT.open('wb') as f:writer.write(f)
print(OUT)
