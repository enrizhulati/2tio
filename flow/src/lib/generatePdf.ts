import { jsPDF } from 'jspdf';
import { SERVICE_INFO, type OrderConfirmation, type UserProfile, type SelectedPlans } from '@/types/flow';

interface GeneratePdfParams {
  orderConfirmation: OrderConfirmation;
  profile: UserProfile;
  selectedPlans: SelectedPlans;
}

export function generateOrderPdf({
  orderConfirmation,
  profile,
  selectedPlans,
}: GeneratePdfParams): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors (RGB values)
  const coral = [255, 111, 97];
  const teal = [32, 201, 151];
  const darkest = [52, 58, 64];
  const dark = [108, 117, 125];

  let yPos = 20;

  // Helper functions
  const addText = (text: string, x: number, y: number, options: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold';
    color?: number[];
    align?: 'left' | 'center' | 'right';
  } = {}) => {
    const { fontSize = 12, fontStyle = 'normal', color = darkest, align = 'left' } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, { align });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Header with brand
  doc.setFillColor(coral[0], coral[1], coral[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  addText('2TurnItOn', 20, 22, { fontSize: 24, fontStyle: 'bold', color: [255, 255, 255] });
  addText('Order Confirmation', pageWidth - 20, 22, { fontSize: 14, color: [255, 255, 255], align: 'right' });

  yPos = 50;

  // Order number and date
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 25, 3, 3, 'F');

  addText('Order Number:', 20, yPos + 5, { fontSize: 10, color: dark });
  addText(orderConfirmation.orderId, 20, yPos + 14, { fontSize: 14, fontStyle: 'bold' });

  addText('Order Date:', pageWidth - 20, yPos + 5, { fontSize: 10, color: dark, align: 'right' });
  addText(formatShortDate(), pageWidth - 20, yPos + 14, { fontSize: 12, align: 'right' });

  yPos += 35;

  // Service Address Section
  doc.setFillColor(teal[0], teal[1], teal[2]);
  doc.rect(15, yPos, 3, 18, 'F');

  addText('Service Address', 23, yPos + 5, { fontSize: 12, fontStyle: 'bold' });
  addText(
    `${orderConfirmation.address.street}${orderConfirmation.address.unit ? `, ${orderConfirmation.address.unit}` : ''}`,
    23,
    yPos + 13,
    { fontSize: 11 }
  );
  addText(
    `${orderConfirmation.address.city}, ${orderConfirmation.address.state} ${orderConfirmation.address.zip}`,
    23,
    yPos + 20,
    { fontSize: 11, color: dark }
  );

  yPos += 35;

  // Service Start Date
  doc.setFillColor(teal[0], teal[1], teal[2]);
  doc.rect(15, yPos, 3, 12, 'F');

  addText('Service Start Date', 23, yPos + 5, { fontSize: 12, fontStyle: 'bold' });
  addText(formatDate(orderConfirmation.moveInDate), 23, yPos + 13, { fontSize: 11 });

  yPos += 28;

  // Account Holder
  doc.setFillColor(teal[0], teal[1], teal[2]);
  doc.rect(15, yPos, 3, 20, 'F');

  addText('Account Holder', 23, yPos + 5, { fontSize: 12, fontStyle: 'bold' });
  addText(`${profile.firstName} ${profile.lastName}`, 23, yPos + 13, { fontSize: 11 });
  addText(profile.email, 23, yPos + 20, { fontSize: 10, color: dark });
  addText(profile.phone, 23, yPos + 27, { fontSize: 10, color: dark });

  yPos += 42;

  // Services Section
  addText('Services Ordered', 15, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 8;

  // Draw line
  doc.setDrawColor(206, 212, 218);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;

  // Service cards
  orderConfirmation.services.forEach((service) => {
    const plan = selectedPlans[service.type];
    const serviceLabel = SERVICE_INFO[service.type].label;

    // Service box
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(15, yPos - 3, pageWidth - 30, plan ? 35 : 25, 2, 2, 'F');

    // Service icon placeholder (colored dot)
    const iconColors: Record<string, number[]> = {
      water: [59, 130, 246],
      electricity: [245, 158, 11],
      internet: [139, 92, 246],
    };
    doc.setFillColor(iconColors[service.type][0], iconColors[service.type][1], iconColors[service.type][2]);
    doc.circle(25, yPos + 6, 4, 'F');

    addText(serviceLabel, 35, yPos + 3, { fontSize: 12, fontStyle: 'bold' });
    addText(service.provider, 35, yPos + 11, { fontSize: 10, color: dark });

    // Status badge
    doc.setFillColor(255, 248, 230);
    doc.roundedRect(pageWidth - 55, yPos - 1, 40, 14, 2, 2, 'F');
    addText('Setting up...', pageWidth - 35, yPos + 7, { fontSize: 8, color: [230, 119, 0], align: 'center' });

    if (plan) {
      addText(`${plan.name} - ${plan.rate}`, 35, yPos + 19, { fontSize: 10, color: dark });
      addText(plan.contractLabel, 35, yPos + 26, { fontSize: 9, color: dark });
    }

    yPos += plan ? 42 : 32;
  });

  yPos += 5;

  // What happens next section
  doc.setFillColor(230, 249, 243);
  doc.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F');

  addText('What happens next', 20, yPos + 10, { fontSize: 12, fontStyle: 'bold', color: teal as number[] });
  addText('1. We submit your information to each provider', 20, yPos + 20, { fontSize: 10 });
  addText('2. You\'ll receive confirmation emails within 24 hours', 20, yPos + 28, { fontSize: 10 });
  addText('3. Utilities will be active on your move-in date', 20, yPos + 36, { fontSize: 10 });

  yPos += 55;

  // Footer
  doc.setDrawColor(206, 212, 218);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 10;

  addText('Questions? Contact support@2tion.com', pageWidth / 2, yPos, {
    fontSize: 10,
    color: dark,
    align: 'center'
  });

  addText('2TurnItOn - Making moving easier', pageWidth / 2, yPos + 8, {
    fontSize: 9,
    color: dark,
    align: 'center'
  });

  // Save the PDF
  doc.save(`2TurnItOn-Order-${orderConfirmation.orderId}.pdf`);
}
