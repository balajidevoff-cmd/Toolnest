import React from 'react';
import { useParams } from 'react-router-dom';
import { TOOLS } from '../data/tools';
import { ToolWorkspaceLayout } from '../components/tools/ToolWorkspaceLayout';
import { EmptyState } from '../components/tools/EmptyState';

// PDF & Documents
import { PdfMergerTool } from '../components/tools/pdf/PdfMergerTool';
import { PdfSplitterTool } from '../components/tools/pdf/PdfSplitterTool';
import { PdfCompressorTool } from '../components/tools/pdf/PdfCompressorTool';
import { ImagesToPdfTool } from '../components/tools/pdf/ImagesToPdfTool';
import { PdfPreviewTool } from '../components/tools/pdf/PdfPreviewTool';
import { WordCounterTool } from '../components/tools/text/WordCounterTool';

// Image Studio
import { ImageResizerTool } from '../components/tools/image/ImageResizerTool';
import { ImageCompressorTool } from '../components/tools/image/ImageCompressorTool';
import { ImageConverterTool } from '../components/tools/image/ImageConverterTool';
import { ImageCropperTool } from '../components/tools/image/ImageCropperTool';
import { ColorPickerTool } from '../components/tools/image/ColorPickerTool';
import { ImageMetadataTool } from '../components/tools/image/ImageMetadataTool';
import { ImageEnhancerTool } from '../components/tools/image/ImageEnhancerTool';

// Audio & Video Studio
import { AudioTrimmerTool } from '../components/tools/media/AudioTrimmerTool';
import { AudioCompressorTool } from '../components/tools/media/AudioCompressorTool';
import { AudioMergerTool } from '../components/tools/media/AudioMergerTool';
import { VideoTrimmerTool } from '../components/tools/media/VideoTrimmerTool';
import { VideoCompressorTool } from '../components/tools/media/VideoCompressorTool';
import { VideoEnhancerTool } from '../components/tools/media/VideoEnhancerTool';

// QR & Code
import { QrGeneratorTool } from '../components/tools/qr-dev/QrGeneratorTool';
import { QrReaderTool } from '../components/tools/qr-dev/QrReaderTool';
import { JsonFormatterTool } from '../components/tools/qr-dev/JsonFormatterTool';
import { UrlEncoderTool } from '../components/tools/qr-dev/UrlEncoderTool';
import { HtmlEncoderTool } from '../components/tools/qr-dev/HtmlEncoderTool';
import { Base64Tool } from '../components/tools/qr-dev/Base64Tool';
import { Sha256Tool } from '../components/tools/qr-dev/Sha256Tool';
import { TextDiffTool } from '../components/tools/qr-dev/TextDiffTool';
import { UuidGeneratorTool } from '../components/tools/qr-dev/UuidGeneratorTool';
import { RegexTesterTool } from '../components/tools/qr-dev/RegexTesterTool';

// Calculators & Converters
import { ScientificCalculatorTool } from '../components/tools/calculators/ScientificCalculatorTool';
import { CgpaCalculatorTool } from '../components/tools/calculators/CgpaCalculatorTool';
import { PercentageCalculatorTool } from '../components/tools/calculators/PercentageCalculatorTool';
import { UnitConverterTool } from '../components/tools/calculators/UnitConverterTool';
import { AgeCalculatorTool } from '../components/tools/calculators/AgeCalculatorTool';
import { DateCalculatorTool } from '../components/tools/calculators/DateCalculatorTool';
import { StorageConverterTool } from '../components/tools/calculators/StorageConverterTool';
import { GstCalculatorTool } from '../components/tools/calculators/GstCalculatorTool';

// Text & Writing
import { CaseConverterTool } from '../components/tools/text/CaseConverterTool';
import { RemoveSpacesTool } from '../components/tools/text/RemoveSpacesTool';
import { TextToSlugTool } from '../components/tools/text/TextToSlugTool';
import { MarkdownPreviewTool } from '../components/tools/text/MarkdownPreviewTool';
import { TextReplaceTool } from '../components/tools/text/TextReplaceTool';
import { CharacterCounterTool } from '../components/tools/text/CharacterCounterTool';

// Privacy & Security
import { PasswordGeneratorTool } from '../components/tools/security/PasswordGeneratorTool';
import { PassphraseGeneratorTool } from '../components/tools/security/PassphraseGeneratorTool';
import { PasswordStrengthTool } from '../components/tools/security/PasswordStrengthTool';
import { ChecksumVerifierTool } from '../components/tools/security/ChecksumVerifierTool';

export const ToolWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    return (
      <div className="py-12">
        <EmptyState
          title="Utility Not Found"
          description={`No tool registered with slug "${slug}". Please explore our tools directory.`}
          actionText="Browse All Tools"
          onAction={() => (window.location.href = '/tools')}
        />
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (tool.slug) {
      // PDF & Documents
      case 'pdf-merger':
        return <PdfMergerTool />;
      case 'pdf-splitter':
        return <PdfSplitterTool />;
      case 'pdf-compressor':
        return <PdfCompressorTool />;
      case 'images-to-pdf':
        return <ImagesToPdfTool />;
      case 'pdf-preview':
        return <PdfPreviewTool />;
      case 'word-counter':
        return <WordCounterTool />;

      // Image Studio
      case 'image-resizer':
        return <ImageResizerTool />;
      case 'image-compressor':
        return <ImageCompressorTool />;
      case 'image-converter':
        return <ImageConverterTool />;
      case 'image-cropper':
        return <ImageCropperTool />;
      case 'color-picker':
        return <ColorPickerTool />;
      case 'image-metadata':
        return <ImageMetadataTool />;
      case 'image-enhancer':
        return <ImageEnhancerTool />;

      // QR & Developer Tools
      case 'qr-generator':
        return <QrGeneratorTool />;
      case 'qr-reader':
        return <QrReaderTool />;
      case 'json-formatter':
        return <JsonFormatterTool />;
      case 'url-encoder':
        return <UrlEncoderTool />;
      case 'html-encoder':
        return <HtmlEncoderTool />;
      case 'base64-tool':
        return <Base64Tool />;
      case 'sha256-generator':
        return <Sha256Tool />;
      case 'text-diff':
        return <TextDiffTool />;
      case 'uuid-generator':
        return <UuidGeneratorTool />;
      case 'regex-tester':
        return <RegexTesterTool />;

      // Calculators & Converters
      case 'scientific-calculator':
        return <ScientificCalculatorTool />;
      case 'cgpa-calculator':
        return <CgpaCalculatorTool />;
      case 'percentage-calculator':
        return <PercentageCalculatorTool />;
      case 'unit-converter':
        return <UnitConverterTool />;
      case 'age-calculator':
        return <AgeCalculatorTool />;
      case 'date-calculator':
        return <DateCalculatorTool />;
      case 'storage-converter':
        return <StorageConverterTool />;
      case 'gst-calculator':
        return <GstCalculatorTool />;

      // Text & Writing
      case 'case-converter':
        return <CaseConverterTool />;
      case 'remove-spaces':
        return <RemoveSpacesTool />;
      case 'text-to-slug':
        return <TextToSlugTool />;
      case 'markdown-preview':
        return <MarkdownPreviewTool />;
      case 'text-replace':
        return <TextReplaceTool />;
      case 'character-counter':
        return <CharacterCounterTool />;

      // Privacy & Security
      case 'password-generator':
        return <PasswordGeneratorTool />;
      case 'passphrase-generator':
        return <PassphraseGeneratorTool />;
      case 'password-strength':
        return <PasswordStrengthTool />;
      case 'checksum-verifier':
        return <ChecksumVerifierTool />;

      // Audio & Video Studio
      case 'audio-trimmer':
        return <AudioTrimmerTool />;
      case 'audio-compressor':
        return <AudioCompressorTool />;
      case 'audio-merger':
        return <AudioMergerTool />;
      case 'video-trimmer':
        return <VideoTrimmerTool />;
      case 'video-compressor':
        return <VideoCompressorTool />;
      case 'video-enhancer':
        return <VideoEnhancerTool />;

      default:
        return (
          <div className="p-8 text-center text-light-muted">
            This tool is currently preparing its interface.
          </div>
        );
    }
  };

  return (
    <ToolWorkspaceLayout tool={tool}>
      {renderToolComponent()}
    </ToolWorkspaceLayout>
  );
};
